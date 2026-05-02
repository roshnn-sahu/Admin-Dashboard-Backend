import multer from "multer";
import path from "path";

// Multer storage configuration for Profile image store
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "public", "uploads", "profile"));
    },
    filename: function (req, file, cb) {
        const { id } = req.params;
        if (!id) {
            return cb(new Error("User ID is required"));
        }
        cb(null, `${id}-profile${path.extname(file.originalname)}`);
    },
});

export const profileUploads = multer({ storage: profileStorage });
