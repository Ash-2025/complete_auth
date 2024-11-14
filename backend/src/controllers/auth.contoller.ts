import { set, z } from "zod";
import catchErrors from "../utils/catchErrors";
import { createAccount, loginUser, refreshUserAccessToken, resetPassword, sendPasswordResetEmail, verifyEmail } from "../services/auth.service";
import { clearAuthCookies, getAccessTokenOptions, getRefreshTokenOptions, setAuthCookies } from "../utils/cookies";
import { CREATED, OK, UNAUTHORIZED } from "../constants/httpcodes";
import jwt from 'jsonwebtoken'
import { prisma } from "../db/schema";
import { Session } from "node:inspector/promises";
import appAssert from "../utils/appAssert";

const registerSchema = z.object({
    email:z.string().email().min(8).max(50),
    password:z.string().min(8).max(16),
    confirmPassword:z.string().min(8).max(16),
    userAgent:z.string().optional()
}).refine((data)=> data.password === data.confirmPassword , {
    message:"Password do not match",
    path:["confirmPassword"]
});

const loginSchema = z.object({
    email:z.string().email().min(8).max(50),
    password:z.string().min(8).max(16),
    userAgent:z.string().optional()
})

const verificationCodeSchema = z.string().min(1).max(24)
const emailSchema = z.string().min(12).max(30)
const PasswordSchema = z.string().min(8).max(30)

export const resetPasswordSchema = z.object({
    password:PasswordSchema,
    verificationCode: verificationCodeSchema
})


export const registerHandler = catchErrors(async(req , res)=> {
    //validate request
    const request = registerSchema.parse({
        ...req.body,
        userAgent:req.headers["user-agent"]
    })
    
    //call service auth.service.ts
    const {user,accessToken,refreshToken} = await createAccount(request)

    return setAuthCookies({res,accessToken,refreshToken}).status(CREATED).json(user);
})

export const loginHandler = catchErrors(async(req,res)=>{

    //validate request
    const request = loginSchema.parse({
        ...req.body,
        userAgent:req.headers['user-agent']
    });

    const {accessToken,refreshToken} = await loginUser(request)

    return setAuthCookies({res,accessToken,refreshToken}).status(OK).json({
        message:'login succesfull'
    })
})

export const logoutHandler = catchErrors(async(req,res)=>{
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken
    const payload = jwt.verify(accessToken,process.env.JWT_SECRET!) as {session:string}
    console.log(payload);

    await prisma.session.delete({
        where:{
            sessionId:payload.session
        }
    })
    return res.clearCookie(accessToken).clearCookie(refreshToken).status(OK).json({
        message:"logout"
    });
})

export const refreshHandler = catchErrors(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken as string | undefined
    appAssert(refreshToken,UNAUTHORIZED,"Missing Token")

    const {accessToken,newRefreshToken} = await refreshUserAccessToken(refreshToken)

    if(newRefreshToken!==undefined){
        res.cookie("refreshToken",newRefreshToken,getRefreshTokenOptions())
    }
    return res.status(OK).cookie("accessToken",accessToken,getAccessTokenOptions()).json({
        message:"Tokens updated succesfully"
    })
})

export const verifyEmailHandler = catchErrors(async(req,res)=> {
    // parse the req with zod schema
    const verificationCode = verificationCodeSchema.parse(req.params.code)
    await verifyEmail(verificationCode);

    return res.status(OK).json({
        message:"Email verified"
    })
})

export const sendPasswordResetHandler = catchErrors(async(req,res)=>{
    const email = emailSchema.parse(req.body.email)

    await sendPasswordResetEmail(email);

    return res.status(OK).json({
        message:'Password reset email sent'
    })
})

export const ResetHandler = catchErrors(async(req,res)=>{
    const request = resetPasswordSchema.parse(req.body);

    await resetPassword(request);

    return clearAuthCookies(res).status(OK).json({
        message:"Password reset successful"
    })
})