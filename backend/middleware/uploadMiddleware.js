// =========================
// BACKEND: backend/middleware/uploadMiddleware.js
// =========================
// backend/middleware/uploadMiddleware.js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /(jpeg|jpg|png|webp)/i;
  if (!allowed.test(file.mimetype) && !allowed.test(file.originalname)) {
    cb(new Error("Only image files allowed (jpeg,jpg,png,webp)"));
  } else cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
