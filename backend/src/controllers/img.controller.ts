import catchErrors from "../utils/catchErrors";


export const ConvertImage = catchErrors(async(req,res)=>{
    const i = req.params.input
    const o = req.params.output
    return res.json({
        data:{i,o}
    })    
})