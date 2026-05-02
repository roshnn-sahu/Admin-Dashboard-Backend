import express from "express";
import { createPage, getAllPages, getPageById, getPageByUrl, updatePage, deletePage, } from "../controllers/cmsControllers.js";
import upload from "../middleware/multer-uploads/cmsUploads.js";

const router = express.Router();

router.post("/create-cms", upload, createPage);
router.get("/", getAllPages);
router.get("/page/*url", getPageByUrl);// for dynamic page renderingf
router.get("/pages/:id", getPageById);
router.put("/pages/:id", upload, updatePage);
router.delete("/pages/:id", deletePage);

export default router;
