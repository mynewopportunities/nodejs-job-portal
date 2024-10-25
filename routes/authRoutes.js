import express from "express";
import {
  loginController,
  registerController, // Corrected the name
} from "../controllers/authController.js";

//router object
const router = express.Router();

//routes
router.post("/register", registerController); // Corrected the name

//LOGIN || POST
router.post("/login", loginController);

//export
export default router;
