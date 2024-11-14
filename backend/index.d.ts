import { Prisma } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            userId : string,
            sessionId : string
        }
    }
}