import assert from "node:assert"
import { AppErrorCode } from "../constants/AppErrorCode"
import { httpCodeType } from "../constants/httpcodes"
import AppError from "./AppError"


type AppAssert = (
    condition:any,
    httpStatusCode:httpCodeType,
    message:string,
    appErrorCode?:AppErrorCode
 ) => asserts condition

const appAssert:AppAssert = (
    condition,
    httpStatusCode,
    message,
    appErrorCode
    ) => assert(condition, new AppError(httpStatusCode,message,appErrorCode))

export default appAssert;