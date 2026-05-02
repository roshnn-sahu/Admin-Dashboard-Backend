import express from "express";
import { loginUser, registerUser, logoutUser, checkAuth, updateProfile, changePassword, forgetPassword } from '../controllers/authControllers.js';
import userAuthentication from "../middleware/userAuthentication.js";
import { profileUploads } from "../middleware/multer-uploads/profileUploads.js";
import { companyUploads } from "../middleware/multer-uploads/companyUploads.js";
import getClientDetails from "../middleware/getClientInfo.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", getClientDetails, loginUser);
// POST /api/auth/signup
router.post("/register", userAuthentication, getClientDetails, profileUploads.single('image'), registerUser);
//Logout Route
router.get("/logout", userAuthentication, getClientDetails, logoutUser);
//Check User Logged In or Not
router.get("/check-auth", userAuthentication, checkAuth);
//Update Profile
router.put("/update-profile/:id", userAuthentication, profileUploads.single('image'), updateProfile);
//Change Password
router.post("/change-password", userAuthentication, changePassword);
//Forget Password
router.post("/forget-password", forgetPassword);



export default router;


