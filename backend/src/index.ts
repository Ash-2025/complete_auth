require('dotenv').config();
import express from 'express'
import { prisma } from './db/schema';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import  ErrorHandler  from './middlewares/ErrorHandler';
import { authRoutes } from './routes/auth.route';
const PORT = 4004;
import sharp from 'sharp'
import { createWorker } from 'tesseract.js';
import { ImgRoute } from './routes/img.route';
import { DocumentRouter } from './routes/doc.route';
import { authenticate } from './middlewares/authenticate';
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(
    cors({
        // origin:APP_ORIGIN,
        credentials:true
    })
)

app.use(cookieParser());

app.get("/",(req,res)=>{
    res.json({
        message:"Server running"
    })
})


app.use("/auth",authRoutes);

//user routes
app.use("/user",authenticate , userRoutes);


//middleware to handle error
app.use(ErrorHandler)
app.listen(PORT, async()=>{
    console.log(`listening on port ${PORT}`);
    
})

