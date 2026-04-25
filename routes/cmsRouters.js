import express from "express";
import { createPage, getAllPages, getPageById, getPageByUrl, updatePage, deletePage, } from "../controllers/cmsControllers.js";

const router = express.Router();

router.post("/create-cms", createPage);
router.get("/", getAllPages);
router.get("/url/:url", getPageByUrl); // for dynamic page renderingf
router.get("/:id", getPageById);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

export default router;
