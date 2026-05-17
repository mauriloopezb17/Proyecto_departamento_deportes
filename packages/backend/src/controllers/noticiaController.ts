
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
    const id = req.params.id as string;
    const noticia = await noticiaService.getNoticiaById(parseInt(id, 10));
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
    const id_usuario_autor = 1;
    if (!id_usuario_autor) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { titulo, contenido, id_categoria_noticia, resumen, publicado, imagenes } =
      req.body;

    if (!titulo || !contenido) {
      return res
        .status(400)
        .json({ error: "titulo y contenido son requeridos" });
    }

    const id_noticia = await noticiaService.createNoticia({
      id_usuario_autor,
      id_categoria_noticia: id_categoria_noticia ?? null,
      titulo,
      contenido,
      resumen: resumen || null,
      publicado: publicado ?? false,
      imagenes: imagenes ?? [],
    });

    res.status(201).json({ message: "Noticia creada con éxito", id_noticia });
  } catch (error) {
    console.error("Error al crear noticia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateNoticia = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await noticiaService.updateNoticia(parseInt(id, 10), req.body);
    res.json({ message: "Noticia actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteNoticia = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await noticiaService.deleteNoticia(parseInt(id, 10));
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