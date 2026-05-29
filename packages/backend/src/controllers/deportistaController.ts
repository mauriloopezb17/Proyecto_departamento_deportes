import { Request, Response } from 'express';
import * as deportistaService from '../services/deportistaService';

export const obtenerDestacados = async (req: Request, res: Response) => {
  try {
    const destacados = await deportistaService.getJugadoresDestacados();
    res.json(destacados);
  } catch (error) {
    console.error('Error al obtener jugadores destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};