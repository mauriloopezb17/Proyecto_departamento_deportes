import pool from '../config/db';

export const getEntrenadores = async () => {
  const query = `
    SELECT 
      e.id_entrenador, 
      p.nombres, 
      p.ape_paterno, 
      p.ape_materno, 
      e.url_foto,
      d.nombre_disciplina, 
      c.nombre_categoria
    FROM ENTRENADORES e
    JOIN USUARIOS u ON e.id_usuario = u.id_usuario
    JOIN PERSONAS p ON u.id_persona = p.id_persona
    JOIN ENTRENADOR_ASIGNACION ea ON e.id_entrenador = ea.id_entrenador
    JOIN DISCIPLINAS d ON ea.id_disciplina = d.id_disciplina
    JOIN CATEGORIAS c ON ea.id_categoria = c.id_categoria
    ORDER BY p.nombres ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getHorarios = async () => {
  const query = `
    SELECT 
      ph.dia_semana, 
      ph.hora_inicio, 
      ph.hora_fin, 
      d.nombre_disciplina, 
      e.nombre_espacio,
      tb.nombre_bloqueo,
      per.nombres AS entrenador_nombres,
      per.ape_paterno AS entrenador_apellido
    FROM PLANTILLA_HORARIOS_FIJOS ph
    JOIN DISCIPLINAS d ON ph.id_disciplina = d.id_disciplina
    JOIN ESPACIOS e ON ph.id_espacio = e.id_espacio
    JOIN TIPOS_BLOQUEO tb ON ph.id_tipo_bloqueo = tb.id_tipo_bloqueo
    LEFT JOIN ENTRENADORES en ON ph.id_entrenador = en.id_entrenador
    LEFT JOIN USUARIOS u ON en.id_usuario = u.id_usuario
    LEFT JOIN PERSONAS per ON u.id_persona = per.id_persona
    WHERE tb.nombre_bloqueo = 'Entrenamiento'
    ORDER BY ph.dia_semana ASC, ph.hora_inicio ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getGaleriaEventos = async () => {
  const query = `
    SELECT 
      id_multimedia, 
      url_archivo, 
      tipo_archivo, 
      id_torneo, 
      id_partido,
      fecha_subida
    FROM GALERIA_MULTIMEDIA
    WHERE publicado = TRUE 
      AND (id_torneo IS NOT NULL OR id_partido IS NOT NULL)
    ORDER BY fecha_subida DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};