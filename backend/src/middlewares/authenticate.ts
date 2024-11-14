import {RequestHandler} from 'express'
import appAssert from '../utils/appAssert';
import { UNAUTHORIZED } from '../constants/httpcodes';
import { AppErrorCode } from '../constants/AppErrorCode';
import jwt from 'jsonwebtoken'
import { decodeToken } from '../utils/cookies';
export const authenticate:RequestHandler = (req,res,next) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(accessToken,UNAUTHORIZED,"Not authorized",AppErrorCode.InvalidAccessToken)

    // in case this doesnt work as expected , use the verifiyToken function from the github repository
    const {payload,error} = decodeToken(accessToken);

    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
}