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

export const getResultadosGenerales = async () => {
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

export const getProximosPartidosGenerales = async () => {
  const query = `
    SELECT p.id_partido, p.fecha, p.hora_inicio, p.fase_torneo, p.estado,
           el.nombre_equipo AS equipo_local, ev.nombre_equipo AS equipo_visitante,
           t.nombre AS torneo_nombre, e.nombre_espacio AS espacio
    FROM PARTIDOS p
    JOIN EQUIPOS el ON p.id_equipo_local = el.id_equipo
    JOIN EQUIPOS ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN TORNEOS t ON p.id_torneo = t.id_torneo
    LEFT JOIN ESPACIOS e ON p.id_espacio = e.id_espacio
    WHERE p.estado = 'Programado'
    ORDER BY p.fecha ASC, p.hora_inicio ASC
    LIMIT 10;
  `;
  const result = await pool.query(query);
  return result.rows;
};
export const getTorneos = async () => {
  const query = `
    SELECT id_torneo, nombre, id_disciplina 
    FROM TORNEOS 
    WHERE estado IN ('Planificado', 'En curso') 
    ORDER BY nombre ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getTablaPosiciones = async (idTorneo: number, idDisciplina?: number) => {
  const params: any[] = [idTorneo];
  let disciplinaFilter = "";

  if (idDisciplina) {
    params.push(idDisciplina);
    disciplinaFilter = ` AND t.id_disciplina = $2`;
  }

  const query = `
    WITH Stats AS (
      SELECT
        p.id_equipo_local AS id_equipo,
        p.goles_local AS GF,
        p.goles_visitante AS GC,
        CASE WHEN p.goles_local > p.goles_visitante THEN 1 ELSE 0 END AS PG,
        CASE WHEN p.goles_local = p.goles_visitante THEN 1 ELSE 0 END AS PE,
        CASE WHEN p.goles_local < p.goles_visitante THEN 1 ELSE 0 END AS PP
      FROM PARTIDOS p
      JOIN TORNEOS t ON p.id_torneo = t.id_torneo
      WHERE p.id_torneo = $1 AND p.estado = 'Finalizado' ${disciplinaFilter}
      
      UNION ALL
      
      SELECT
        p.id_equipo_visitante AS id_equipo,
        p.goles_visitante AS GF,
        p.goles_local AS GC,
        CASE WHEN p.goles_visitante > p.goles_local THEN 1 ELSE 0 END AS PG,
        CASE WHEN p.goles_visitante = p.goles_local THEN 1 ELSE 0 END AS PE,
        CASE WHEN p.goles_visitante < p.goles_local THEN 1 ELSE 0 END AS PP
      FROM PARTIDOS p
      JOIN TORNEOS t ON p.id_torneo = t.id_torneo
      WHERE p.id_torneo = $1 AND p.estado = 'Finalizado' ${disciplinaFilter}
    )
    SELECT
      e.id_equipo,
      e.nombre_equipo,
      COALESCE(COUNT(s.id_equipo)::int, 0) AS pj,
      COALESCE(SUM(s.PG)::int, 0) AS pg,
      COALESCE(SUM(s.PE)::int, 0) AS pe,
      COALESCE(SUM(s.PP)::int, 0) AS pp,
      COALESCE(SUM(s.GF)::int, 0) AS gf,
      COALESCE(SUM(s.GC)::int, 0) AS gc,
      COALESCE((SUM(s.GF) - SUM(s.GC))::int, 0) AS dg,
      COALESCE((SUM(s.PG) * 3 + SUM(s.PE))::int, 0) AS pts
    FROM EQUIPOS e
    JOIN TORNEOS t ON e.id_torneo = t.id_torneo
    LEFT JOIN Stats s ON e.id_equipo = s.id_equipo
    WHERE e.id_torneo = $1 ${disciplinaFilter}
    GROUP BY e.id_equipo, e.nombre_equipo
    ORDER BY pts DESC, dg DESC, gf DESC, e.nombre_equipo ASC;
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getPartidosPorTorneo = async (idTorneo: number, idDisciplina?: number) => {
  let query = `
    SELECT p.id_partido, p.fecha, p.hora_inicio, p.goles_local, p.goles_visitante, p.estado, p.fase_torneo,
           el.nombre_equipo AS equipo_local, ev.nombre_equipo AS equipo_visitante,
           e.nombre_espacio AS espacio, t.nombre AS torneo_nombre, d.nombre_disciplina
    FROM PARTIDOS p
    JOIN EQUIPOS el ON p.id_equipo_local = el.id_equipo
    JOIN EQUIPOS ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN TORNEOS t ON p.id_torneo = t.id_torneo
    LEFT JOIN ESPACIOS e ON p.id_espacio = e.id_espacio
    LEFT JOIN DISCIPLINAS d ON t.id_disciplina = d.id_disciplina
    WHERE p.id_torneo = $1
  `;
  const params: any[] = [idTorneo];

  if (idDisciplina) {
    query += ` AND t.id_disciplina = $2`;
    params.push(idDisciplina);
  }

  query += ` ORDER BY p.fecha DESC, p.hora_inicio DESC;`;
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getGoleadores = async (idTorneo: number, idDisciplina?: number) => {
  let query = `
    SELECT
        dep.id_deportista,
        per.nombres || ' ' || per.ape_paterno AS jugador,
        eq.nombre_equipo AS equipo,
        SUM(epj.puntos_goles)::int AS goles
    FROM ESTADISTICAS_PARTIDO_JUGADOR epj
    JOIN PARTIDOS p ON epj.id_partido = p.id_partido
    JOIN TORNEOS t ON p.id_torneo = t.id_torneo
    JOIN DEPORTISTAS dep ON epj.id_deportista = dep.id_deportista
    JOIN PERSONAS per ON dep.id_persona = per.id_persona
    JOIN EQUIPO_JUGADORES ej ON dep.id_deportista = ej.id_deportista
    JOIN EQUIPOS eq ON ej.id_equipo = eq.id_equipo AND eq.id_torneo = p.id_torneo
    WHERE p.id_torneo = $1 AND epj.puntos_goles > 0
  `;
  const params: any[] = [idTorneo];

  if (idDisciplina) {
    query += ` AND t.id_disciplina = $2`;
    params.push(idDisciplina);
  }

  query += `
    GROUP BY dep.id_deportista, per.nombres, per.ape_paterno, eq.nombre_equipo
    ORDER BY goles DESC
    LIMIT 20;
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getTarjetas = async (idTorneo: number, idDisciplina?: number) => {
  let query = `
    SELECT
        eq.id_equipo,
        eq.nombre_equipo AS equipo,
        COALESCE(SUM(epj.faltas_tarjetas_amarillas)::int, 0) AS amarillas,
        COALESCE(SUM(epj.faltas_tarjetas_rojas)::int, 0) AS rojas
    FROM EQUIPOS eq
    JOIN TORNEOS t ON eq.id_torneo = t.id_torneo
    LEFT JOIN EQUIPO_JUGADORES ej ON eq.id_equipo = ej.id_equipo
    LEFT JOIN ESTADISTICAS_PARTIDO_JUGADOR epj ON ej.id_deportista = epj.id_deportista
    LEFT JOIN PARTIDOS p ON epj.id_partido = p.id_partido AND p.id_torneo = eq.id_torneo
    WHERE eq.id_torneo = $1
  `;
  const params: any[] = [idTorneo];

  if (idDisciplina) {
    query += ` AND t.id_disciplina = $2`;
    params.push(idDisciplina);
  }

  query += `
    GROUP BY eq.id_equipo, eq.nombre_equipo
    ORDER BY rojas DESC, amarillas DESC, equipo ASC;
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};