import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
    storage,
    // Por seguridad el limite es 5MB
    limits: { fileSize: 5 * 1024 * 1024 } 
});