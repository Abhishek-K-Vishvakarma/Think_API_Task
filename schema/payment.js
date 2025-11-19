import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User_Admin', required: true},
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders', required: true},
  razorpay_order_id : {type: String, required: true},
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: Number,
  currency: {type: String, default: 'INR'},
  status: {type: String, enum: ['created', 'paid', 'failed'], default: 'created'},
  paymentMethod: String
}, {timestamps: true});

export default mongoose.model("Payment", paymentSchema);