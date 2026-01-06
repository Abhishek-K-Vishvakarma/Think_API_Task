import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  orderId: String,
  createdAt: String
});

export default mongoose.model("Log", logSchema);
