import { Request, Response } from 'express';
import * as galeriaService from '../services/galeriaService';

export const obtenerGaleria = async (req: Request, res: Response) => {
  try {
    const soloPublicados = req.query.publicado === 'true';
    const galeria = await galeriaService.getGaleria(soloPublicados);
    res.json(galeria);
  } catch (error) {
    console.error('Error al obtener galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const crearElementoGaleria = async (req: Request, res: Response) => {
  try {
    const { url_archivo, tipo_archivo } = req.body;
    
    const id_usuario_autor = (req as any).user.id_usuario;

    if (!url_archivo || !tipo_archivo) {
      return res.status(400).json({ error: 'La URL del archivo y el tipo son obligatorios' });
    }

    const nuevoElemento = await galeriaService.createMedia({ ...req.body, id_usuario_autor });
    res.status(201).json({ message: 'Elemento guardado en galería', data: nuevoElemento });
  } catch (error) {
    console.error('Error al crear elemento de galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const actualizarElementoGaleria = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10); 
    const actualizado = await galeriaService.updateMedia(id, req.body);
    
    if (!actualizado) return res.status(404).json({ error: 'Elemento no encontrado' });
    res.json({ message: 'Elemento actualizado', data: actualizado });
  } catch (error) {
    console.error('Error al actualizar galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const eliminarElementoGaleria = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10); 
    const eliminado = await galeriaService.deleteMedia(id);
    
    if (!eliminado) return res.status(404).json({ error: 'Elemento no encontrado' });
    res.json({ message: 'Elemento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar elemento de galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};