import mongoose from "mongoose";

const AddToCartSchema = new mongoose.Schema({
  user: {
    _id: String,
    name: String,
    email: String,
    role: String
  },
  product: {
    _id: String,
    p_name: String,
    price: Number,
    description: String
  }
}, { timestamps: true });

export default mongoose.model("Addtocart", AddToCartSchema);
