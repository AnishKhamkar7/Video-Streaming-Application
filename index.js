import express from "express";
import cors from "cors"
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path"

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
    console.log("file uploaded")
})


app.listen(8000,()=>{
    console.log("App is listening on 8000...")
})