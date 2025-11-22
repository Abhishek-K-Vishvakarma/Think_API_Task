import mongoose from "mongoose";

const ShippingCustomerAddress = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User_Admin', required: true },
  fullName: { type: String, required: true },
  contactNumber: { type: Number, required: true },
  street: { type: String, required: true },     
  landMark: { type: String },                  
  city: { type: String, required: true },      
  state: { type: String, required: true },      
  postalCode: { type: Number, required: true },
  country: { type: String, required: true },   
  role: { type: String, default: 'Customer' }
}, { timestamps: true });

export default mongoose.model("ShippingAddress", ShippingCustomerAddress);
