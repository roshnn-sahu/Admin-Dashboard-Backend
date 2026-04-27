import multer from "multer";
import path from "path";
//Multer storage configration for Profile image store
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/profile");
    },
    filename: function (req, file, cb) {
        const { id } = req.params;
        if (!id) res.status(400).json({ redirectUrl: "/admin/login" });


        cb(null, `${id}-profile.png`);

    },
});
export const profileUploads = multer({ storage: profileStorage });

//Multer storage configration  
const companyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/company");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // e.g. ".png"
        const companyId = req.body.companyId || "default"; // Optional: dynamic per company

        // ✅ Handle all fields dynamically (icon, logo, login_icon, login_bg)
        if (["icon", "logo", "login_icon", "login_bg"].includes(file.fieldname)) {
            cb(null, `${file.fieldname}${ext}`);
        } else {
            cb(null, `${file.originalname}`);
        }
    },

    //${file.mimetype.split("/")[1]
});
export const companyUploads = multer({ storage: companyStorage });
