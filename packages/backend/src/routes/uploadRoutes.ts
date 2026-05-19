import { Router } from "express";
import { uploadImage, uploadTempImage } from "../controllers/uploadController";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// "imagen" nombre que debe enviar en FormData
// Sube directo a OCI (portada del modal)
router.post("/", uploadMiddleware.single("imagen"), uploadImage);

// Sube a carpeta temp local (imágenes del editor mientras se redacta)
router.post("/temp", uploadMiddleware.single("imagen"), uploadTempImage);

export default router;