import path from "path";

import uuid from "crypto";
import { supabase } from "./supa";

export async function generatePresignedUrlForUpload(filename:string,type:string){
    const id = uuid.randomBytes(16).toString('hex')
    
    const uId = `${id}${path.extname(filename)}`
    return {uId}
}