import express from "express";
import { UserRegistration, GetUsersorAdmin, Login, AdminRegistration,
  Categories, Products, createOrder, DelProductById,
  GetAllProducts, GetAllCategories, PutProduct } from "../controller/controller.js";
const router = express.Router();

router.post("/signup", UserRegistration);
router.get("/user_admin", GetUsersorAdmin);
router.post("/login", Login);
router.post("/adminSignup", AdminRegistration);
router.post("/category", Categories);
router.post("/product/:id", Products);
router.post("/order", createOrder);
router.delete("/delProduct/:id", DelProductById);
router.get("/getProducts", GetAllProducts);
router.get("/getCategories", GetAllCategories);
router.put("/putProduct/:id", PutProduct);

export default router;