
import mongoose from "mongoose";

const OrderItemsSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true},
  name : String,
  quantity: { type: Number, required: true, min: 1 },
  price: {type: Number, required: true},
});

const Order = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User_Admin", required: true},
  items: [OrderItemsSchema],
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  ShippingAddress : {
   street : String,
   city: String,
   state: String,
   zipCode: String,
   country: String
  }
}, {timestamps: true})

export default mongoose.model("Orders", Order);  
