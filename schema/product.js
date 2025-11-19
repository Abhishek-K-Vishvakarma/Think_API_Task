import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  p_name : {type: String, required: true, unique: true},
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true},
  description: {type: String},
  price: {type: Number, required: true},
}, {timestamps: true});

export default mongoose.model("Products", productSchema);  