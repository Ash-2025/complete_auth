import { verificationCodeType } from "../constants/verifyCodeType";
import { prisma } from "../db/schema";
import jwt  from 'jsonwebtoken'
import { compare, hash } from "../utils/bcrypt";
import appAssert from "../utils/appAssert";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from "../constants/httpcodes";
import { sendMail } from "../utils/resend.config";
import { getPasswordResetTemplate, getVerifyEmailTemplate } from "../utils/emailTemplate";
import { generateRandomId } from "../utils/RandomId";

export type createAccountType = {
    email:string;
    password:string;
    userAgent?:string;
}

export const createAccount = async(data:createAccountType)=>{
    // steps to perform
    //verify existing user doesnt exist
    const existingUser = await prisma.user.findUnique({
        where:{
            email:data.email
        }
    })
    appAssert(!existingUser,CONFLICT,"Email already in use")
    //create user
    const user = await prisma.user.create({
        data:{
            email:data.email,
            password:await hash(data.password),
        }
    })

    //create verification code
    const verificationCode = await prisma.verificationCode.create({
        data:{
            id:user.id,
            expiresAt:new Date(Date.now() + 30 * 60 * 1000),
            type : verificationCodeType.EmailVerification,
            VerificationId : generateRandomId()
        }
    })
    //send verification code - we will do this later
    const url = `${process.env.APP_ORIGIN}/email/verify/${verificationCode.VerificationId}`
    const {data:resendData,error} = await sendMail({
        to:user.email,
        ...getVerifyEmailTemplate(url)
    })
    if(error){
        console.log(error);
    }

    //create session
    const session = await prisma.session.create({
        data:{
            userId:user.id,
            userAgent:data.userAgent,
            expiresAt:new Date(Date.now() + 30*24*60*60*1000)
        }
    })
    //sign jwts
    // dont forget to use session.sessionId to sign the jwt
    const refreshToken = jwt.sign({
        session:session.sessionId,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
        audience:['user'],
        expiresIn:'30d'
    })
    const accessToken = jwt.sign({
        userId:user.id,
        session:session.sessionId
    },
    process.env.JWT_SECRET!,
    {
        audience:['user'],
        expiresIn:'3h'
    })

    //return user and tokens
    return {
        user, // remove password before sending user as json
        accessToken,
        refreshToken
    }
}

export type LoginAccountType = {
    email:string;
    password:string;
    userAgent?:string;
}

export const loginUser = async({email,password,userAgent}:LoginAccountType) => {
    // find user through email
    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    console.log(user);
    // throw an assert error in case user doesnt exist
    appAssert(user,UNAUTHORIZED,"Incorrect Email or Password")
    
    //validate password
    const isPasswordMatching = await compare(password,user?.password)
    appAssert(isPasswordMatching,UNAUTHORIZED,"Incorrect Email or Password")

    const session = await prisma.session.create({
        data:{
            userId:user.id,
            userAgent:userAgent,
            expiresAt:new Date(Date.now() + 30*24*60*60*1000)
        }
    })
    //sign jwts
    // dont forget to use session.sessionId to sign the jwt
    const refreshToken = jwt.sign({
        session:session.sessionId, // add session.sessionId here
    },
    process.env.JWT_REFRESH_SECRET!,
    {
        audience:['user'],
        expiresIn:'30d'
    })
    const accessToken = jwt.sign({
        userId:user.id,
        session:session.sessionId // add session.sessionId here
    },
    process.env.JWT_SECRET!,
    {
        audience:['user'],
        expiresIn:'3h'
    })
    // deleting password so it doesnt go to front end
    delete (user as {password?:string}).password;
    return {
        user,
        accessToken,
        refreshToken
    }

}

export const refreshUserAccessToken = async(Token:string) => {
    const payload = jwt.verify(Token,process.env.JWT_REFRESH_SECRET!) as {session:string}

    console.log(`PAYLOAD FROM SESSSION ------------------------------------------------${payload.session}`)
    appAssert(payload, UNAUTHORIZED, "Invalid refresh token");
    const session = await prisma.session.findUnique({
        where:{
            sessionId:payload.session
        }
    })
    appAssert(
        session && session.expiresAt.getTime() > Date.now(),
        UNAUTHORIZED,
        "Session Expired"
    )
    // we will refresh the session if it's going to expire in the next 24hrs
    const SessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= 24*60*60*1000
    if(SessionNeedsRefresh){
        const date = new Date(Date.now()+ 30*24*60*60*1000)
        await prisma.session.update({
            where:{
                sessionId:payload.session
            },
            data:{
                expiresAt:date
            }
        })
    }
    const newRefreshToken = SessionNeedsRefresh ? jwt.sign({
        session:session.sessionId, // add session.sessionId here
    },
    process.env.JWT_REFRESH_SECRET!,
    {
        audience:['user'],
        expiresIn:'30d'
    }) : undefined

    const accessToken = jwt.sign({
        userId:session.userId,
        session:session.sessionId // add session.sessionId here
    },
    process.env.JWT_SECRET!,
    {
        audience:['user'],
        expiresIn:'3h',
        
    })
    return {
        accessToken,newRefreshToken
    }
}

export const verifyEmail = async (code:string) => {
    const validCode = await prisma.verificationCode.findFirst({
        where:{
            VerificationId:code,
            type:verificationCodeType.EmailVerification,
        },
    })
    appAssert(validCode,NOT_FOUND,"Invalid or Expired Verification code")

    const updatedUser = await prisma.user.update({
        where:{
            id:validCode.id
        },
        data:{
            verified:true
        }
    })
    appAssert(updatedUser,INTERNAL_SERVER_ERROR,"Failed to verify Email")

    //delete the valid code record from db
    await prisma.verificationCode.delete({
        where:{
            id:validCode.id
        }
    })
    return {updatedUser}
}

export const sendPasswordResetEmail = async(email:string) => {

    // get the user
    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    // apply rate limit
    const FiveMinutes = new Date(Date.now() + 5*60)
    const tries = await prisma.verificationCode.findMany({
        where:{
        //    user:{
        //     id:user?.id
        //    },
           id:user?.id,
           type:verificationCodeType.passwordReset,
           createdAt:{gt:FiveMinutes}
        }
    })
    appAssert(tries.length <=1 , TOO_MANY_REQUESTS, "Too many requests. Please try again later!")

    // generate verification code
    const oneHour = new Date(Date.now() + 60*60)
    const verificationCode = await prisma.verificationCode.create({
        data:{
            id:user?.id,
            type:verificationCodeType.passwordReset,
            expiresAt:oneHour,
            VerificationId:generateRandomId()
        }
    })
    const url = `${process.env.APP_ORIGIN}/password/reset?code=${verificationCode.VerificationId}&exp=${oneHour.getTime()}`

    // send verification email
    const {data,error} = await sendMail({
        to:user?.email || '',
        ...getPasswordResetTemplate(url)
    })
    appAssert(data?.id , INTERNAL_SERVER_ERROR,`${error?.name}-${error?.message}`)
    return {
        url,
        emailId:data.id
    }
}

type resetPasswordParams = {
    password:string,
    verificationCode:string,
}
export const resetPassword = async({password,verificationCode}:resetPasswordParams) => {
    // get the verification code
    const validCode = await prisma.verificationCode.findFirst({
        where:{
            VerificationId:verificationCode,
            type:verificationCodeType.passwordReset,
            expiresAt:{gt:new Date()}
        }
    })
    appAssert(validCode,NOT_FOUND,"Invalid or expired verification code")
    //update the user's password
    const updatedUser = await prisma.user.update({
        where:{
            id:validCode?.id
        },
        data:{
            password: await hash(password)
        }
    })
    appAssert(updatedUser,INTERNAL_SERVER_ERROR,"Failed to reset password")
    // delete the verification code
    await prisma.verificationCode.delete({
        where:{
            id:validCode?.id,
            type:verificationCodeType.passwordReset
        }
    })
    // delete all session related to this user
    await prisma.session.deleteMany({
        where:{
            userId:validCode?.id
        }
    })
    return {
        updatedUser
    }
}