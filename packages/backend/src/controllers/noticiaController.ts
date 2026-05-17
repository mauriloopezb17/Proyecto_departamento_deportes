import { Request, Response } from "express";
import * as noticiaService from "../services/noticiaService";

export const getNoticias = async (req: Request, res: Response) => {
  try {
    const soloPublicados = req.query.publicado === "true";
    const noticias = await noticiaService.getAllNoticias(soloPublicados);
    res.json(noticias);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getNoticia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const noticia = await noticiaService.getNoticiaById(parseInt(id as string));
    if (!noticia) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    res.json(noticia);
  } catch (error) {
    console.error("Error en la obtención de noticia", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createNoticia = async (req: Request, res: Response) => {
  try {
    const id_noticia = await noticiaService.createNoticia(req.body);
    res.status(201).json({ message: "Noticia creada con éxito", id_noticia });
  } catch (error) {
    console.error("Error al crear noticia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateNoticia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await noticiaService.updateNoticia(parseInt(id as string), req.body);
    res.json({ message: "Noticia actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteNoticia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await noticiaService.deleteNoticia(parseInt(id as string));
    if (!deleted) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    res.json({ message: "Noticia eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getCategorias = async (_req: Request, res: Response) => {
  try {
    const categorias = await noticiaService.getCategorias();
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
