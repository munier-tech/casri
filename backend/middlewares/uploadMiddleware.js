import multer from "multer";
import path from "path";

// ✅ Storage config: use memory storage on Vercel, disk locally
const storage = process.env.VERCEL === '1'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, "uploads/");
      },
      filename: function (_req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

// ✅ File filter (only images)
export const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

export default upload;
