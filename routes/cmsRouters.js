import express from "express";
import { createPage, getAllPages, getPageById, getPageByUrl, updatePage, deletePage, } from "../controllers/cmsControllers.js";

const router = express.Router();

router.post("/create-cms", createPage);
router.get("/", getAllPages);
router.get("/page/*url", getPageByUrl);// for dynamic page renderingf
router.get("/pages/:id", getPageById);
router.put("/pages/:id", updatePage);
router.delete("/pages/:id", deletePage);

export default router;
