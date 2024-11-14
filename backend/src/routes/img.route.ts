import {Request, Response, Router} from 'express'
import multer, { memoryStorage } from 'multer'
import sharp from 'sharp'
// import { ConvertImage } from '../controllers/img.controller';


export const ImgRoute = Router()
const uploads = multer({storage:memoryStorage(),preservePath:true})

const ConvertImage = async(req:Request,res:Response) => {
    console.log("reached logic ")
    console.log(req.file)
    console.log(req.body)
    try {
        // Specify new format
        const newFormat = req.body.toFormat; // Change to 'png', 'jpg', 'jpeg', etc.
    
        // Convert image format
        const converted = await sharp(req.file?.buffer)
          .toFormat(newFormat)
          .toBuffer();
    
        // Send converted image
        res.set("content-type", `image/${newFormat}`);
        res.set("Content-Disposition", `attachment; filename=${req.file?.originalname.split('.')[0]}.${newFormat}`);
        console.log(converted);
        res.send(converted);
      } catch (error) {
        console.log(error);
        res.status(500).send("image format conversion failed");
      }
}

const ResizeImage = async(req:Request,res:Response) => {
    try {
        const w = req.body.width
        const h = req.body.height

        // Change to 'png', 'jpg', 'jpeg', etc.
        const newFormat = req.body.toFormat || (await sharp(req.file?.buffer).metadata()).format; 
    
        // Convert image format
        const converted = await sharp(req.file?.buffer).resize({
            width:parseInt(w),
            height:parseInt(h)
        }).toBuffer()
    
        // Send converted image
        res.set("content-type", `image/${newFormat}`);
        res.set("Content-Disposition", `attachment; filename=${req.file?.originalname.split('.')[0]}.${newFormat}`);
        console.log(converted);
        res.send(converted);
      } catch (error) {
        console.log(error);
        res.status(500).send("image format conversion failed");
      }
}

const CompressImage = async(req:Request,res:Response) => {
    console.log("reached logic ")
    console.log(req.file)
    console.log(req.body)
    try {
        const format = (await sharp(req.file?.buffer).metadata()).format

        const compressed = await sharp(req.file?.buffer).toFormat(format!,{quality:60}).toBuffer()
        res.set('content-type','image/jpeg')
        res.set('Content-Disposition', `attachment; filename=${req.file?.originalname}`);
        console.log(compressed)
        res.send(compressed);

    } catch (error) {
        console.log(error)
        res.status(500).send('image compression failed');
    }
}
const handler = async(req:Request,res:Response) => {
    const {action} = req.params

    switch(action){
        case 'convert':
            console.log("reached switch")
             await ConvertImage(req,res)
             break
        case 'compress':
             await CompressImage(req,res)
             break
        case 'resize':
            await ResizeImage(req,res)
            break
        default:
             res.send("invalid")
             break
    }
    
}
ImgRoute.post("/:action",uploads.single('file'),handler)

