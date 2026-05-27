import { Request, Response } from 'express';
import * as partidoService from '../services/partidoService';

export const obtenerResultadosRecientes = async (req: Request, res: Response) => {
  try {
    const resultados = await partidoService.getResultadosRecientes();
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener resultados recientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerFixtureTorneo = async (req: Request, res: Response) => {
  try {
    const { idTorneo } = req.params;
    
    if (!idTorneo || isNaN(Number(idTorneo))) {
      return res.status(400).json({ error: 'ID de torneo inválido' });
    }

    const fixture = await partidoService.getFixturePorTorneo(Number(idTorneo));
    res.json(fixture);
  } catch (error) {
    console.error('Error al obtener el fixture:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};