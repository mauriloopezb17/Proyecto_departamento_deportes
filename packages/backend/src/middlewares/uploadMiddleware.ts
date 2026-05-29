import multer from "multer";

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato no soportado. Solo se permiten imágenes (JPG, PNG, WEBP) o videos (MP4, WEBM)"));
    }
  },
});