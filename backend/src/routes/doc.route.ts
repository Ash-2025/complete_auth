import {Router} from "express";
import { convertController } from "../controllers/doc.controller";
import multer, { memoryStorage } from "multer";

export const DocumentRouter = Router()


// DocumentRouter.post("/upload" , uploadController)

const uploads = multer({storage:memoryStorage(),preservePath:true})

DocumentRouter.post("/process",uploads.single('file'),convertController)