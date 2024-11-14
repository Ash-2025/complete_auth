import { CookieOptions, Response } from "express"

const secure = process.env.NODE_ENV !== "development"
const defaults:CookieOptions = {
    sameSite:"strict",
    httpOnly:true,
    secure
}
export const getAccessTokenOptions = ():CookieOptions =>({
    ...defaults,
    expires:new Date(Date.now()+3*60*60*1000)
})
export const getRefreshTokenOptions = ():CookieOptions =>({
    ...defaults,
    expires:new Date(Date.now() + 30*24*60*60*1000),
    path:"/auth/refresh"
})
type params = {
    res : Response;
    accessToken:string;
    refreshToken:string;
}
export const setAuthCookies = ({res,accessToken,refreshToken}:params) =>{
    return res.cookie("accessToken",accessToken,getAccessTokenOptions()).cookie("refreshToken",refreshToken,getRefreshTokenOptions())
}
export const clearAuthCookies = (res:Response) => {
    return res.clearCookie("accessToken").clearCookie("refreshToken")
}

// decode jwt token
export const decodeToken = (accessToken:string) => {
    try{
        const arrayToken = accessToken.split('.')
        const payload = JSON.parse(atob(arrayToken[1]));
        console.log(payload);
        return {payload};
    } catch(error:any) {
        return {
            error
        }
    }
}