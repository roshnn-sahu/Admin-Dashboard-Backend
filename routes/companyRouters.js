import express from "express";
import { manageCompany, getCompany } from "../controllers/companyController.js";
import { companyUploads } from "../middleware/multer-uploads/companyUploads.js";
import userAuthentication from "../middleware/userAuthentication.js";
import getClientDetails from "../middleware/getClientInfo.js";

const router = express.Router();

// ✅ Handle multiple image uploads if needed
router.post(
    "/manage-company",
    userAuthentication,
    getClientDetails,
    companyUploads.fields([
        { name: "icon", maxCount: 1 },
        { name: "logo", maxCount: 1 },
        { name: "login_icon", maxCount: 1 },
        { name: "login_bg", maxCount: 1 },
    ]),
    manageCompany
);

router.get('/get-company', getCompany);

export default router;
