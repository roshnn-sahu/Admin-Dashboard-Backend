import cmsModal from "../models/cmsModal.js";


// CREATE
export const createPage = async (req, res) => {


  console.log(req.body)
  // try {
  //   const page = await cmsModal.create(req.body);
  //   res.status(201).json(page);
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
};


// GET ALL
export const getPages = async (req, res) => {
  try {
    const pages = await cmsModal.find().populate("parent");
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET SINGLE
export const getPageById = async (req, res) => {
  try {
    const page = await cmsModal.findById(req.params.id).populate("parent");

    if (!page) return res.status(404).json({ message: "Page not found" });

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET BY URL (for frontend rendering)
export const getPageByUrl = async (req, res) => {
  try {
    const page = await cmsModal.findOne({ url: req.params.url });

    if (!page) return res.status(404).json({ message: "Page not found" });

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE
export const updatePage = async (req, res) => {
  try {
    const page = await cmsModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!page) return res.status(404).json({ message: "Page not found" });

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE
export const deletePage = async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
