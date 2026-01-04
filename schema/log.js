import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  orderId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Log", logSchema);
