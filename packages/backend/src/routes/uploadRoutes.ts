import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// "imagen" nombre que debe enviar en FormData
router.post("/", uploadMiddleware.single("imagen"), uploadImage);

export default router;