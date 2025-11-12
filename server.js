import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/router.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser : true,
  useUnifiedTopology: true
}).then(()=> console.log("MongoDB Atlas database connected!")).catch((err)=> console.error("DataBase disconnected!", err));

app.use("/api", router);

app.listen(process.env.PORT, ()=>{
  console.log(`Server running on port : http://localhost:${process.env.PORT}`);
});