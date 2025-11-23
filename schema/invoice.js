import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  order_id: String,
  payment_id: String,
  signature: String,
  amount: Number,
  currency: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);
