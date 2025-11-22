import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema({
  sub_name: {type: String, required: true, unique: true},
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
  sub_img_url: String,
}, {timestamps: true});

export default mongoose.model("Subcategory", SubcategorySchema);