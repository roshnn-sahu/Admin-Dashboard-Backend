import mongoose from "mongoose";
import cmsModel from "../models/cmsModel.js";


// CREATE


// ✅ Helper: sanitize URL slug
const sanitizeUrl = (url) =>
  url
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_/]/g, "-") // only allow safe chars
    .replace(/-+/g, "-");           // collapse multiple dashes

// ✅ CREATE
export const createPage = async (req, res) => {
  try {
    const data = { ...req.body };

    // Fix parent — only keep if it's a valid ObjectId
    if (!data.parent || !mongoose.isValidObjectId(data.parent)) {
      data.parent = null;
    }

    // Sanitize URL
    if (data.url) {
      data.url = sanitizeUrl(data.url);
    }

    // Parse nested objects safely (in case they come as JSON strings from FormData)
    ["order", "position", "class"].forEach((key) => {
      if (typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch {
          data[key] = {};
        }
      }
    });

    // Ensure order values are numbers
    if (data.order) {
      data.order = {
        menu: Number(data.order.menu) || 0,
        top_header: Number(data.order.top_header) || 0,
        footer: Number(data.order.footer) || 0,
      };
    }

    // Handle images if uploaded
    if (req.files) {
      if (req.files.thumbnail) {
        data.thumbnail = `/uploads/cms/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.breadcrumb) {
        data.breadcrumb = `/uploads/cms/${req.files.breadcrumb[0].filename}`;
      }
    }

    const cms = await cmsModel.create(data);
    res.status(201).json({ success: true, data: cms });

  } catch (err) {
    console.error("createPage error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "URL already exists. Choose a different slug." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// GET ALL PAGES
export const getAllPages = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};

    // Filter by type (page / cms)
    if (type && ["page", "cms"].includes(type)) {
      filter.type = type;
    }

    // Search by name or url
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await cmsModel.countDocuments(filter);

    const pages = await cmsModel
      .find(filter)
      .populate("parent", "name url")   // shows parent's name & url only
      .sort({ createdAt: -1 })          // newest first
      .skip(skip)
      .limit(Number(limit))
      .select("-content -styles");      // skip heavy fields in list view



    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: pages,
    });

  } catch (err) {
    console.error("getAllPages error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET SINGLE PAGE BY ID
export const getPageById = async (req, res) => {
  try {

    // ✅ Check if ID is valid MongoDB ObjectId before querying
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid page ID" });
    }

    const page = await cmsModel  // ✅ fixed typo: cmsModal → cmsModel
      .findById(req.params.id)
      .populate("parent", "name url"); // ✅ only get name & url from parent, not full doc

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    // ✅ consistent response shape like your other controllers
    res.status(200).json({ success: true, data: page });

  } catch (error) {
    console.error("getPageById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BY URL (for frontend rendering)
export const getPageByUrl = async (req, res) => {
  try {
    const rawSlug = Array.isArray(req.params.url)
      ? req.params.url.join("/")
      : req.params.url;

    // ✅ search exactly as stored in DB, no prefix added
    const slug = rawSlug;

    console.log("Looking for slug:", slug); // → "example-cms"

    const page = await cmsModel
      .findOne({ url: slug })
      .populate("parent", "name url");

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    res.status(200).json({ success: true, data: page });

  } catch (error) {
    console.error("getPageByUrl error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// UPDATE
export const updatePage = async (req, res) => {

  try {
    const data = { ...req.body };

    // Parse nested objects safely
    ["order", "position", "class"].forEach((key) => {
      if (typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch {
          data[key] = {};
        }
      }
    });

    // Handle images if uploaded
    if (req.files) {
      if (req.files.thumbnail) {
        data.thumbnail = `/uploads/cms/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.breadcrumb) {
        data.breadcrumb = `/uploads/cms/${req.files.breadcrumb[0].filename}`;
      }
    }

    const page = await cmsModel.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!page) return res.status(404).json({ message: "Page not found" });

    res.status(200).json({ success: true, data: page, message: "Page updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deletePage = async (req, res) => {
  try {
    const page = await cmsModel.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json({ success: true, data: page, message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
