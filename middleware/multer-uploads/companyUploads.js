import multer from "multer";
import path from "path";

// Multer storage configuration for Company images
const companyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "public", "uploads", "company"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        if (["icon", "logo", "login_icon", "login_bg"].includes(file.fieldname)) {
            cb(null, `${file.fieldname}${ext}`);
        } else {
            cb(null, `${file.originalname}`);
        }
    },
});

export const companyUploads = multer({ storage: companyStorage });
