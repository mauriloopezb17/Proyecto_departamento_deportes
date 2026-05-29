import { Request, Response } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, CDN_PUBLIC_URL, OCI_NAMESPACE } from "../config/oracleStorage";


// ── Subir directo a OCI (imagen de portada) ───────────────────────────────────

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No se proporcionó ningún archivo." });
            return;
        }

        let fileBuffer = req.file.buffer;
        let contentType = req.file.mimetype;
        let extension = "bin";

        if (contentType.startsWith("image/")) {
            fileBuffer = await sharp(req.file.buffer)
                .resize({ width: 1000, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            contentType = "image/webp";
            extension = "webp";
        } 
        else if (contentType.startsWith("video/")) {
            extension = contentType === "video/webm" ? "webm" : "mp4";
        }

        const uniqueFilename = `media-${Date.now()}.${extension}`;

        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFilename,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await s3Client.send(uploadCommand);
        const finalPublicUrl = `${CDN_PUBLIC_URL}/n/${OCI_NAMESPACE}/b/${BUCKET_NAME}/o/${uniqueFilename}`;

        res.status(200).json({
            url: finalPublicUrl,
        });
    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        res.status(500).json({ message: "Error interno al subir el archivo." });
    }
};

// ── Guardar en carpeta temp local (imágenes del editor) ───────────────────────
// No va a OCI todavía. Se sube a OCI cuando el usuario guarda o publica.
 
export const uploadTempImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No se proporcionó ninguna imagen." });
      return;
    }
 
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
 
    const filename = `temp-${Date.now()}.webp`;
    const filepath = path.join(tempDir, filename);
 
    await sharp(req.file.buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);
 
    // Devuelve URL temporal que el editor mostrará mientras se redacta
    res.status(200).json({
      success: 1,
      url: `/temp/${filename}`,
    });
 
  } catch (error) {
    console.error("Error al guardar imagen temporal:", error);
    res.status(500).json({ message: "Error interno al guardar la imagen." });
  }
};