import express from "express";
import {
  UserRegistration, GetUsersorAdmin, Login, AdminRegistration,
  Categories, Products, createOrder, createPaymentOrder, paymentVerify,
  Subcategories, AllUsers, AllCategories, AllSubCategories, AllProducts,
  GetAllCategories, GetAllSubcategories, GetAllProducts, DeleteCategory,
  DeleteSubCategory, DeleteProduct, PutCategory, PutSubCategory, PutProduct,
  Logout, getTokenUser, Addedinthecart, GetCartData, deleteCartData
  // DelProductById,
  // GetAllProducts, PutProduct, Lookup 
} from "../controller/controller.js";
import verifyToken from "../utils.js";
const router = express.Router();

router.post("/signup", UserRegistration);
router.get("/user_admin", GetUsersorAdmin);
router.post("/login", Login);
router.post("/adminSignup", AdminRegistration);
router.post("/category", Categories);
router.post("/product", Products);
router.post("/order", createOrder);
router.post("/payorder", createPaymentOrder);
router.post("/payverify", paymentVerify);
router.post("/subcategory", Subcategories);
router.get("/getuserscount", AllUsers);
router.get("/getcategoriescount", AllCategories);
router.get("/getsubcategoriescount", AllSubCategories);
router.get("/getproductscount", AllProducts);
router.get("/getcategories", GetAllCategories);
router.get("/getProducts", GetAllProducts);
router.get("/getsubcategories", GetAllSubcategories);
router.delete("/delcategory/:id", DeleteCategory);
router.delete("/delsubcategory/:id", DeleteSubCategory);
router.delete("/delproduct/:id", DeleteProduct);
router.put("/putcategory/:id", PutCategory);
router.put("/putsubcategory/:id", PutSubCategory);
router.put("/putproduct/:id", PutProduct);
router.post("/logout", verifyToken, Logout);
router.get("/token", getTokenUser);
router.post("/postcart", Addedinthecart);
router.get("/getcart", GetCartData);
router.delete("/deletecart/:id", deleteCartData)


router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({ message: "Users accessed!", users : {
    user : req.user
  }});
});
export default router;