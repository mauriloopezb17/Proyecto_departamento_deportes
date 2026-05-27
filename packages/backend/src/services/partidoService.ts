import pool from '../config/db';

export const getResultadosRecientes = async (): Promise<any[]> => {
  const query = `
    SELECT p.id_partido, p.fecha, p.hora_inicio, p.goles_local, p.goles_visitante, p.estado, p.fase_torneo,
           el.nombre_equipo AS equipo_local, ev.nombre_equipo AS equipo_visitante,
           t.nombre AS torneo_nombre, d.nombre_disciplina AS disciplina
    FROM PARTIDOS p
    JOIN EQUIPOS el ON p.id_equipo_local = el.id_equipo
    JOIN EQUIPOS ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN TORNEOS t ON p.id_torneo = t.id_torneo
    LEFT JOIN DISCIPLINAS d ON t.id_disciplina = d.id_disciplina
    WHERE p.estado = 'Finalizado' 
    ORDER BY p.fecha DESC, p.hora_inicio DESC
    LIMIT 10;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getFixturePorTorneo = async (idTorneo: number): Promise<any[]> => {
  const query = `
    SELECT p.id_partido, p.fecha, p.hora_inicio, p.hora_fin, p.fase_torneo, p.estado,
           el.nombre_equipo AS equipo_local, ev.nombre_equipo AS equipo_visitante,
           e.nombre_espacio AS espacio
    FROM PARTIDOS p
    JOIN EQUIPOS el ON p.id_equipo_local = el.id_equipo
    JOIN EQUIPOS ev ON p.id_equipo_visitante = ev.id_equipo
    LEFT JOIN ESPACIOS e ON p.id_espacio = e.id_espacio
    WHERE p.id_torneo = $1 AND p.estado = 'Programado'
    ORDER BY p.fecha ASC, p.hora_inicio ASC;
  `;
  const result = await pool.query(query, [idTorneo]);
  return result.rows;
};