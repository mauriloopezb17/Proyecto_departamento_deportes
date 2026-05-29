import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const inscribirDeportista = async (req: Request, res: Response) => {
  try {
    const { deportista, inscripcion } = req.body;

    if (!deportista || !inscripcion) {
      return res.status(400).json({ error: 'Faltan los datos del deportista o de la inscripción' });
    }

    const resultado = await adminService.inscribirDeportistaExterno(req.body);
    res.status(201).json(resultado);

  } catch (error: any) {
    console.error('Error al inscribir deportista:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El correo electrónico o CI ya está registrado en el sistema.' });
    }
    res.status(500).json({ error: 'Error interno del servidor al inscribir deportista' });
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { nombres, ape_paterno, fecha_nacimiento, celular, ci, email, id_rol, id_carrera, gestion } = req.body;

    if (!nombres || !ape_paterno || !fecha_nacimiento || !celular || !ci || !email || !id_rol) {
      return res.status(400).json({ error: 'Todos los campos generales obligatorios deben ser llenados' });
    }

    if (id_rol === 3) {
      if (!id_carrera || !gestion) {
        return res.status(400).json({ error: 'Para registrar un Delegado, es obligatorio seleccionar la Carrera e ingresar la Gestión.' });
      }
    }

    const resultado = await adminService.registrarUsuarioSistema(req.body);
    res.status(201).json(resultado);

  } catch (error: any) {
    console.error('Error al registrar usuario administrador:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El correo electrónico o Carnet de Identidad ya está registrado.' });
    }
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
  }
};

export const obtenerCatalogosInscripcion = async (req: Request, res: Response) => {
  try {
    const catalogos = await adminService.getCatalogosFormulario();
    res.json(catalogos);
  } catch (error) {
    console.error('Error al obtener catálogos de inscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar datos del formulario' });
  }
};

export const listarRoles = async (req: Request, res: Response) => {
  try {
    const roles = await adminService.obtenerTodosLosRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar los roles' });
  }
};

export const listarCarreras = async (req: Request, res: Response) => {
  try {
    const carreras = await adminService.getCarreras();
    res.json(carreras);
  } catch (error) {
    console.error('Error al obtener las carreras:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar las carreras' });
  }
};

export const listarDeportistas = async (req: Request, res: Response) => {
  try {
    const deportistas = await adminService.getListaDeportistas();
    res.json(deportistas);
  } catch (error) {
    console.error('Error al listar deportistas:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener la lista de deportistas' });
  }
};

export const registrarHorarioEntrenamiento = async (req: Request, res: Response) => {
  try {
    const { id_espacio, id_disciplina, dia_semana, hora_inicio, hora_fin, id_entrenador } = req.body;

    if (!id_espacio || !id_disciplina || dia_semana === undefined || !hora_inicio || !hora_fin || !id_entrenador) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el horario' });
    }

    if (dia_semana < 1 || dia_semana > 7) {
      return res.status(400).json({ error: 'El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)' });
    }

    const nuevoHorario = await adminService.crearHorarioEntrenamiento(req.body);
    
    res.status(201).json({ 
      message: 'Horario de entrenamiento registrado exitosamente', 
      data: nuevoHorario 
    });

  } catch (error: any) {
    console.error('Error al registrar horario:', error);
    res.status(500).json({ error: 'Error interno al guardar el horario' });
  }
};