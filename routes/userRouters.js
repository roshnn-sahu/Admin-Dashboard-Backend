import express from "express";
import { getAllUsers, deleteUser, getUser, editUser, changeUserPassword } from "../controllers/userControllers.js";
import userAuthentication from "../middleware/userAuthentication.js";
import { profileUploads } from "../middleware/multer-uploads/profileUploads.js";
import getClientDetails from "../middleware/getClientInfo.js";

const router = express.Router();

router.get("/get-all-users", userAuthentication, getAllUsers);
router.get("/get-user/:id", userAuthentication, getUser);
router.put("/edit-user/:id", userAuthentication, getClientDetails, profileUploads.single("image"), editUser);
router.delete("/delete-user/:id", userAuthentication, getClientDetails, deleteUser);
router.post("/change-password/:id", userAuthentication, getClientDetails, changeUserPassword);



export default router;