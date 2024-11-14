import { Readable } from "stream";
import catchErrors from "../utils/catchErrors";
import { generatePresignedUrlForUpload } from "../utils/preSignedUrl";
import { supabase } from "../utils/supa";
import fs from 'fs'
import { exec } from "child_process";
import path from "path";
const util = require('util')

// export const uploadController = catchErrors(async(req , res) => {
//     const {filename,type} = req.body
//     const {uId} = await generatePresignedUrlForUpload(filename,type)
//     res.send({uId})
// })

// function bufferToStream(buffer: any) {
//     return new Readable({
//       read() {
//         this.push(buffer);
//         this.push(null);
//       },
//     });
//   }

const execAsync = util.promisify(exec);
export const convertController = catchErrors(async(req,res)=> {
    
    // const tempInputPath = `/tmp/${uId}`;
    // const tempOutputPath = `/tmp/${uId}.pdf`;

    const filebuffer = req.file?.buffer
    const target = req.body.target
    
    console.log(req.file)

    if (!filebuffer) {
      return res.status(400).send("File is required.");
    }
    if (!target) {
      return res.status(400).send("Target format is required.");
    }

    const tmpInput = path.join(__dirname,`/tmp`)
    const filename = `${req.file?.originalname.substring(0,4)}`;
    const filePath = path.join(tmpInput, filename);
    console.log(tmpInput)
    
    const tmpOutput = path.join(__dirname,"/otmp")
    console.log(tmpOutput)

    // wrtie file to folder
    await fs.promises.writeFile(filePath,filebuffer)

    // we will use exec process and libre-convert package to convert files from one format to another
    
    // exec(`libreoffice --headless --convert-to ${target} ${filePath} --outdir ${tmpOutput}`)
    try {
      await execAsync(`libreoffice --headless --convert-to ${target} ${filePath} --outdir ${tmpOutput}`);
      console.log('Conversion completed successfully');
    } catch (error) {
      console.error('Error during conversion:', error);
      res.status(500).send('Conversion failed');
      return;
    }
    console.log('no error on exec')
    

    console.log(fs.readdirSync(tmpOutput))
    const convertedDocument = fs.readFileSync(`${tmpOutput}/${req.file?.originalname.substring(0,4)}.${target}`) // this line error
    console.log('no error on reading file from output dir')

    res.set({
      'Content-Type': `application/${target}`,
      'Content-Disposition': `attachment; filename="converted.${target}"`,
    });
    res.send(convertedDocument)



    // we need to change these 2 lines and handle file deletion correctly
    await fs.promises.unlink(tmpInput)
    await fs.promises.unlink(tmpOutput)

    // console.log(fileData || fileError)
    // const buf = bufferToStream(await fileData?.arrayBuffer())
    // buf.pipe(inputStream)
})