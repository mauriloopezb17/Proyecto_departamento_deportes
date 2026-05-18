import { Request, Response } from "express";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, CDN_PUBLIC_URL, OCI_NAMESPACE } from "../config/oracleStorage";

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No se proporcionó ninguna imagen." });
            return;
        }

        const optimizedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1000, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const uniqueFilename = `cms-${Date.now()}.webp`;

        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFilename,
            Body: optimizedBuffer,
            ContentType: "image/webp",
        });

        await s3Client.send(uploadCommand);
        const finalPublicUrl = `${CDN_PUBLIC_URL}/n/${OCI_NAMESPACE}/b/${BUCKET_NAME}/o/${uniqueFilename}`;

        res.status(200).json({
            success: true,
            url: finalPublicUrl
        });

    } catch (error) {
        console.error("Error al procesar la imagen:", error);
        res.status(500).json({ message: "Error interno al subir la imagen." });
    }
};