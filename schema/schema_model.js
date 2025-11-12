import mongoose from "mongoose";

const Schema_Model = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String},
  role: {type: String, enum: ["User", "Customer", "Admin"], default: 'User'},
}, {timestamps: true});

export default mongoose.model("User_Admin", Schema_Model);