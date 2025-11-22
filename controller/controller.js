import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import User_Admin from "../schema/schema_model.js";
import Category from "../schema/category.js";
import Product from "../schema/product.js";
import Orders from "../schema/order.js";
import Payment from "../schema/payment.js";
import dotenv from "dotenv";
import Subcategory from "../schema/subcategory.js";
import Addtocart from "../schema/addtocart.js";
import ShippingAddress from "../schema/shippingAddress.js";
dotenv.config();
// import mongoose from "mongoose";
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
    res.status(201).json({ message: "User Registration successfully!", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required!" });

    const user = await User_Admin.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found!" });

    const compare = await bcrypt.compare(password, user.password);
    if (!compare)
      return res.status(400).json({ message: "Password does not match!" });
    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });
    user.token = token;
    await user.save();
    res.status(201).json({
      message: "Login successful",
      data: { _id: user._id, email: user.email, role: user.role, token: token, message: "Login successful" },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const Logout = async (req, res) => {
  try {
    const userId = req.user._id;
    await User_Admin.findByIdAndUpdate(userId, { token: "" });
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
    });
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


const getTokenUser = async (req, res) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token not found in cookies or header", status_code: 401 });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User_Admin.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", status_code: 404 });
    }
    res.status(200).json({
      message: "Token verified successfully",
      status_code: 200,
      user,
      token,
    });
  } catch (err) {
    res.status(401).json({
      message: "Invalid or expired token",
      status_code: 401,
      error: err.message,
    });
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

const Categories = async (req, res) => {
  try {
    const { c_name, description } = req.body;
    const n = await Category.findOne({ c_name });
    if (c_name == "") return res.status(400).json({ message: "Category name required!" });
    if (n) return res.status(400).json({ message: "category name already exists!" });
    const newC = new Category({ c_name, description });
    const saveC = await newC.save();
    res.status(201).json({ message: "Category created successfully!", saveC });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
}

const Subcategories = async (req, res) => {
  try {
    const { sub_name, description, categoryId } = req.body;
    if (categoryId == "") return res.status(400).json({ message: "CategoryId is required!" });
    if (sub_name == "") return res.status(400).json({ message: "Subcategory name is required!" });
    const sub = await Subcategory.findOne({ sub_name });
    if (sub) return res.status(400).json({ message: "Subcategory name already exists!" });
    const file = req.file?.path;
    const newSubcategory = new Subcategory({ sub_name, description, category: categoryId, sub_img_url: file });
    const saveSubcategory = await newSubcategory.save();
    res.status(201).json({ message: "Subcategory created successfully!", saveSubcategory });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error:", error: error.message });
  }
}

const Products = async (req, res) => {
  try {
    const { p_name, price, description, categoryId, subcategoryId } = req.body;
    if (!p_name) return res.status(400).json({ message: "Product name required!" });
    if (!price) return res.status(400).json({ message: "Product price required!" });
    if (!categoryId) return res.status(400).json({ message: "CategoryId required!" });
    if (!subcategoryId) return res.status(400).json({ message: "SubcategoryId required!" });
    const existProduct = await Product.findOne({ p_name });
    if (existProduct) {
      return res.status(400).json({ message: "Product name already exists!" });
    }
    const file = req.file?.path;
    const newData = new Product({
      p_name,
      price,
      description,
      category: categoryId,
      subcategory: subcategoryId,
      product_img_url: file
    });

    const saveData = await newData.save();
    res.status(201).json({
      message: "Product created successfully!",
      saveData,
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};


const createOrder = async (req, res) => {
  try {
    const { userId, items, ShippingAddress, paymentMethod, paymentStatus } = req.body;
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
      paymentMethod,
      paymentStatus
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

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${ Date.now() }`,
    };

    const order = await instance.orders.create(options);

    const payment = new Payment({
      order: orderId,
      user: userId,
      razorpay_order_id: order.id,
      amount: amount,
      status: "created"
    });
    console.log(payment);
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      payment
    });

  } catch (error) {
    console.log("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

const paymentVerify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
    const matchSignature = expectedSignature == razorpay_signature;
    if (matchSignature) {
      await Payment.findOneAndUpdate({ razorpay_order_id }, {
        razorpay_payment_id,
        razorpay_signature,
        status: "paid"
      });
      res.status(200).json({
        success: true,
        message: "Payment verification successfully"
      });
    } else {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { status: "failed" }
      );
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    };
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({ message: 'Internal Server error :', error: error.message, success: false });
  }
}

const AllUsers = async (req, res) => {
  try {
    const users = await User_Admin.countDocuments({});
    res.status(200).json({ message: "All users got it!", users });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error :', error: error.message, success: false });
  }
};

const AllCategories = async (req, res) => {
  try {
    const categories = await Category.countDocuments({});
    res.status(200).json({ message: "All Categories got it!", categories });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error :', error: error.message, success: false });
  }
}

const AllSubCategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.countDocuments({});
    res.status(200).json({ message: "All SubCategories got it!", subcategories });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error :', error: error.message, success: false });
  }
}

const AllProducts = async (req, res) => {
  try {
    const products = await Product.countDocuments({});
    res.status(200).json({ message: "All Products got it!", products });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error :', error: error.message, success: false });
  }
}

const GetAllCategories = async (req, res) => {
  try {
    const AllCategoreis = await Category.find({});
    res.status(200).json({ message: "All Categories got it!", data: AllCategoreis });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const GetAllSubcategories = async (req, res) => {
  try {
    const AllSubcategories = await Subcategory.find({});
    res.status(200).json({ message: "All Subcategories got it!", data: AllSubcategories });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const GetAllProducts = async (req, res) => {
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

const DeleteCategory = async (req, res) => {
  try {
    const id = await Category.findOneAndDelete({ _id: req.params.id });
    if (!id) return res.status(404).json({ message: "Category id not exists! or already deleted" });
    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const DeleteSubCategory = async (req, res) => {
  try {
    const id = await Subcategory.findOneAndDelete({ _id: req.params.id });
    if (!id) return res.status(404).json({ message: "Subcategory id not exists! or already deleted" });
    res.status(200).json({ message: "Subcategory deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

const DeleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete({ _id: id });
    if (!product) return res.status(404).json({ message: "Product not found or already deleted!" });
    res.status(200).json({
      message: "Product deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const PutCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({
      message: "Category Updated successfully!",
      category
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const PutSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const subcategory = await Subcategory.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });
    res.status(200).json({
      message: "Subcategory Updated successfully!",
      subcategory
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const PutProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({
      message: "Product Updated successfully!",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const Addedinthecart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User_Admin.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: "User or Product not found" });
    }

    const newCart = new Addtocart({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      product: {
        _id: product._id,
        p_name: product.p_name,
        price: product.price,
        description: product.description
      }
    });

    const saved = await newCart.save();

    res.status(201).json({
      message: "Added to cart successfully",
      status: 201,
      cart: saved
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};

const GetCartData = async (req, res) => {
  try {
    const resCartData = await Addtocart.find({});
    if (!resCartData) return res.status(404).json({ message: "Cart data not found!" });
    res.status(200).json({ message: "Cart data getting successfully!", resCartData });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}

const deleteCartData = async (req, res) => {
  try {
    const id = req.params.id;
    await Addtocart.findByIdAndDelete({ _id: id });
    if (!id) return res.status(404).json({ message: "Cart data not found!" });
    res.status(200).json({ message: "Cart data getting successfully!", id });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}

const ShippingAddressofCustomer = async (req, res) => {
  try {
    const { userId, fullName, contactNumber, street, landMark, city, state, postalCode, country } = req.body;
    if (!fullName || !contactNumber || !street || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const newShippingAddress = new ShippingAddress({ fullName, contactNumber, street, landMark, city, state, postalCode, country, user: userId });
    const saveShippingAddress = await newShippingAddress.save();
    res.status(201).json({ message: "Shipping Addess created!", saveShippingAddress });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}

const GetShippingAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId.length !== 24) {
      return res.status(400).json({
        message: "Invalid userId format",
        status: false
      });
    }
    const shippingAddress = await ShippingAddress.findOne({ user: userId });

    if (!shippingAddress) {
      return res.status(404).json({
        message: "No Shipping Address found for this user. Please add one.",
        status: false
      });
    }

    res.status(200).json({
      message: "Shipping Address retrieved successfully!",
      data: shippingAddress,
      status: true
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};



export {
  UserRegistration, Login, AdminRegistration, Categories, Products,
  createOrder, GetUsersorAdmin, createPaymentOrder, paymentVerify, Subcategories,
  AllUsers, AllCategories, AllSubCategories, AllProducts, GetAllCategories,
  GetAllProducts, GetAllSubcategories, DeleteCategory, DeleteSubCategory,
  DeleteProduct, PutCategory, PutSubCategory, PutProduct, Logout, getTokenUser,
  Addedinthecart, GetCartData, deleteCartData, ShippingAddressofCustomer,
  GetShippingAddressByUserId
};