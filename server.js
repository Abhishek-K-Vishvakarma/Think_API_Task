import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/router.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
dotenv.config();
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://think-reactjs-gvg7fd82u-abhishek-s-projects-febf22af.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser : true,
  useUnifiedTopology: true
}).then(()=> console.log("MongoDB Atlas database connected!")).catch((err)=> console.error("DataBase disconnected!", err));

app.use("/api", router);

app.listen(process.env.PORT, ()=>{
  console.log(`Server running on port : http://localhost:${process.env.PORT}`);
});