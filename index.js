import express from "express";
import cors from "cors"
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path"
import fs from "fs"
import {exec} from "child_process" //watch outchat
import { stderr, stdout } from "process";

const app = express()

//multer middleware

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname))
    }
  })
  

//multer configuration
const upload = multer({ storage: storage })




app.use(
    cors({
        origin: ["http://localhost:3000","http://localhost:5173"],
        credentials:true
    })
)

app.use((req,res,next) =>{
    res.header("Access-Control-Allow-Origin","*") //watch it
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With, Content-Type, Accept"
    );
    next()
})

//recommended code for the above two middlewares from GPT
// app.use(
//     cors({
//         origin: ["http://localhost:3000", "http://localhost:5173"],
//         credentials: true,
//         allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
//     })
// );


app.use(express.json())
app.use(express.urlencoded({extendede: true}))
app.use("/uploads",express.static("uploads"))




app.get('/',(req,res) =>{
    res.json({
        message: "my vivdeo player"
    })
})
//route

app.post("/uploads",upload.single("file"),(req,res)=>{
    const lessonID = uuidv4();
    const videoPath = req.file.path
    const outputPath = `./uploads/courses/${lessonID}`
    const hlsPath = `${outputPath}/index.m3u8`
    console.log("hlspath:",hlsPath)

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath,{recursive: true})
    }

    //ffmpeg 
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`


    //no queue because of POC(proof of concept), not to be used in production
    exec(ffmpegCommand,(error,stdout,stderr) =>{
        if(error){
            console.log(`exec error: ${error}`)
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
        const videoUrl = `http://localhost:8000/uploads/courses/${lessonID}/index.m3u8`;

        res.json({
            message:  "Video Converted to  HLD format",
            lessonId: lessonID,
            videoUrl: videoUrl 
        })

    })




})


app.listen(8000,()=>{
    console.log("App is listening on 8000...")
})