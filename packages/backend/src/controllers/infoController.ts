import { Request, Response } from 'express';
import * as infoService from '../services/infoService';

export const obtenerEntrenadores = async (req: Request, res: Response) => {
  try {
    const entrenadores = await infoService.getEntrenadores();
    res.json(entrenadores);
  } catch (error) {
    console.error('Error al obtener entrenadores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerHorarios = async (req: Request, res: Response) => {
  try {
    const horarios = await infoService.getHorarios();
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerGaleriaClub = async (req: Request, res: Response) => {
  try {
    const galeria = await infoService.getGaleriaEventos();
    res.json(galeria);
  } catch (error) {
    console.error('Error al obtener galería del club:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerEspacios = async (req: Request, res: Response) => {
  try {
    const espacios = await infoService.getEspacios();
    res.json(espacios);
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};