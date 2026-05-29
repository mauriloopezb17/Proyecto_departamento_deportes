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

export const obtenerResultados = async (req: Request, res: Response) => {
  try {
    const resultados = await partidoService.getResultadosGenerales();
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerProximosPartidos = async (req: Request, res: Response) => {
  try {
    const proximos = await partidoService.getProximosPartidosGenerales();
    res.json(proximos);
  } catch (error) {
    console.error('Error al obtener próximos partidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const listarTorneos = async (req: Request, res: Response) => {
  try {
    const torneos = await partidoService.getTorneos();
    res.json(torneos);
  } catch (error) {
    console.error('Error al listar torneos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerTablaPosiciones = async (req: Request, res: Response) => {
  try {
    const { idTorneo } = req.params;
    const { disciplina } = req.query;
    
    if (!idTorneo || isNaN(Number(idTorneo))) {
      return res.status(400).json({ error: 'ID de torneo inválido' });
    }

    const idDisciplina = disciplina && !isNaN(Number(disciplina)) ? Number(disciplina) : undefined;

    const tabla = await partidoService.getTablaPosiciones(Number(idTorneo), idDisciplina);
    res.json(tabla);
  } catch (error) {
    console.error('Error al obtener tabla de posiciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerPartidosTorneo = async (req: Request, res: Response) => {
  try {
    const { idTorneo } = req.params;
    const { disciplina } = req.query;
    
    if (!idTorneo || isNaN(Number(idTorneo))) {
      return res.status(400).json({ error: 'ID de torneo inválido' });
    }

    const idDisciplina = disciplina && !isNaN(Number(disciplina)) ? Number(disciplina) : undefined;
    const partidos = await partidoService.getPartidosPorTorneo(Number(idTorneo), idDisciplina);
    res.json(partidos);
  } catch (error) {
    console.error('Error al obtener los partidos del torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerGoleadores = async (req: Request, res: Response) => {
  try {
    const { idTorneo } = req.params;
    const { disciplina } = req.query;

    if (!idTorneo || isNaN(Number(idTorneo))) {
      return res.status(400).json({ error: 'ID de torneo inválido' });
    }

    const idDisciplina = disciplina && !isNaN(Number(disciplina)) ? Number(disciplina) : undefined;
    const goleadores = await partidoService.getGoleadores(Number(idTorneo), idDisciplina);
    res.json(goleadores);
  } catch (error) {
    console.error('Error al obtener goleadores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerTarjetas = async (req: Request, res: Response) => {
  try {
    const { idTorneo } = req.params;
    const { disciplina } = req.query;

    if (!idTorneo || isNaN(Number(idTorneo))) {
      return res.status(400).json({ error: 'ID de torneo inválido' });
    }

    const idDisciplina = disciplina && !isNaN(Number(disciplina)) ? Number(disciplina) : undefined;
    const tarjetas = await partidoService.getTarjetas(Number(idTorneo), idDisciplina);
    res.json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tabla de tarjetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const listarDisciplinas = async (req: Request, res: Response) => {
  try {
    const disciplinas = await partidoService.getDisciplinas();
    res.json(disciplinas);
  } catch (error) {
    console.error('Error al listar disciplinas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};