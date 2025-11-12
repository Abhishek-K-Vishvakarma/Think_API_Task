import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User_Admin from "../schema/schema_model.js";
import Category from "../schema/category.js";
import Product from "../schema/product.js";
import Orders from "../schema/order.js";
const UserRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User_Admin.findOne({ email });
    if (!name || !email) return res.status(400).json({ message: "name and email field are required!" });
    if (user) return res.status(400).json({ message: "User email already exists!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = await User_Admin.create({
      name, 
      email, 
      password: hashedPassword,
    });
    res.status(201).json({message: "User registration successfully!", data});
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
};

const Login = async(req, res)=>{
  try {
    const { email, password } = req.body;
    const user = await User_Admin.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) return res.status(400).json({ message: "User password does not matched!" });
    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, role: user.role == "User" || "Admin" }, process.env.SECRET_KEY, {expiresIn: '1h'});
    res.status(201).json({ message: "User registration successfully!", data : {
      _id : user._id, email : user.email, role: user.role, token: token,
    } });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
}

const GetUsersorAdmin = async (req, res) => {
  try {
    const users_admin = await User_Admin.find({});
    res.status(200).json({
      message: "All users got it! successfully!", users_admin
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const AdminRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User_Admin.findOne({ email });
    if (!name || !email) return res.status(400).json({ message: "name and email field are required!" });
    if (user) return res.status(400).json({ message: "Admin email already exists!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "Admin";
    const data = await User_Admin.create({
      name,
      email,
      password: hashedPassword,
      role
    });
    res.status(201).json({ message: "Admin registration successfully!", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
};

const Categories = async(req, res)=>{
  try{
    const { c_name , description} = req.body;
    const n = await Category.findOne({ c_name });
    if (!c_name || !description) return res.status(400).json({ message: "All fields are required!" });
    if (n) return res.status(400).json({ message: "category name already exists!"});
    const newC = new Category({c_name, description});
    const saveC = await newC.save();
    res.status(201).json({ message: "Category created successfully!", saveC});
  }catch(error){
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
}

const Products = async (req, res) => {
  try {
    const {p_name, price, description} = req.body;
    const id = req.params.id;
    const newData = new Product({p_name, price, description, categoryId: id});
    const saveData = await newData.save();
    res.status(201).json({ message: "Product created successfully!", saveData});
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
}

const createOrder = async (req, res) => {
  try {
    const { userId, items, ShippingAddress } = req.body;
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "User ID and items are required." });
    }
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${ item.product }` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const newOrder = new Orders({
      user: userId,
      items: orderItems,
      ShippingAddress,
      status: "pending",
    });
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order created successfully!",
      order: savedOrder,
      totalAmount,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const GetAllCategories = async (req, res) => {
  try {
    const AllCategoreis = await Category.find({});
    res.status(200).json({ message: "All products got it!", data: AllCategoreis });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const GetAllProducts = async(req, res)=>{
  try {
    const AllProducts = await Product.find({});
    res.status(200).json({ message: "All products got it!", data: AllProducts });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const DelProductById = async(req, res)=>{
  try{
   const id = req.params.id;
   await User_Admin.findByIdAndDelete({_id: id});
    res.status(200).json({
      message: "Single Product deleted successfully!",
    });
  }catch(error){
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const PutProduct = async(req, res)=>{
  try {
    const id = req.params.id;
    await Product.findByIdAndUpdate({ _id: id }, {$set: req.body}, {new: true});
    res.status(200).json({
      message: "Single Product updated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export { UserRegistration, Login, AdminRegistration, Categories, Products, createOrder, DelProductById, GetAllProducts, GetAllCategories, PutProduct, GetUsersorAdmin };