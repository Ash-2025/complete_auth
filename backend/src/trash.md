

app.use("/document", DocumentRouter)

app.use("/img",ImgRoute)
// app.post("/img", uploads.single('file') ,async(req,res)=>{
    
//     console.log(req.file)
//     try {
//         const compressed = await sharp(req.file?.buffer).resize({width:800,height:800}).jpeg({quality:70}).toBuffer()
//         res.set('content-type','image/jpeg')
//         res.set('Content-Disposition', `attachment; filename=${req.file?.originalname}`);
//         console.log(compressed)
//         res.send(compressed);

//     } catch (error) {
//         console.log(error)
//         res.status(500).send('image compression failed');
//     }
// })


// app.post("/imgTotxt" ,uploads.single('file'), async(req,res) => {
//     console.log(req.file)
//     const lang = req.body.language
//     try {
//         const base64Img = `data:image/png;base64,${req?.file?.buffer.toString('base64')}`
        
//         const worker = await createWorker(lang)
//         const result = await worker.recognize(base64Img)
//         console.log(result.data.text)

//         res.send(result.data.text)
//     } catch (error) {
//         console.log(error);
//     }
// })