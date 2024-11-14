import { AppErrorCode } from "../constants/AppErrorCode";
import { httpCodeType } from "../constants/httpcodes";

class AppError extends Error{
    constructor(
        public statusCode:httpCodeType,
        public message:string,
        public errorCode?:AppErrorCode
    ){
        super(message)
    }
}

export default AppError