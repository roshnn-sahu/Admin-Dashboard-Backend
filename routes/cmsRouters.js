import express from "express";
import {createPage,getPages,getPageById,getPageByUrl,updatePage,deletePage,} from "../controllers/cmsControllers.js";

const router = express.Router();

router.post("/create-cms", createPage);
router.get("/", getPages);
router.get("/url/:url", getPageByUrl); // for dynamic page rendering
router.get("/:id", getPageById);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

export default router;
