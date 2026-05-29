import pool from '../config/db';

export const getGaleria = async (soloPublicados: boolean) => {
  let query = `
    SELECT g.*, 
           u.email AS autor_email, 
           p.nombres AS autor_nombres, 
           p.ape_paterno AS autor_apellido
    FROM GALERIA_MULTIMEDIA g
    JOIN USUARIOS u ON g.id_usuario_autor = u.id_usuario
    JOIN PERSONAS p ON u.id_persona = p.id_persona
  `;
  
  if (soloPublicados) {
    query += ` WHERE g.publicado = TRUE`;
  }
  query += ` ORDER BY g.fecha_subida DESC;`;
  
  const result = await pool.query(query);
  return result.rows;
};

export const createMedia = async (data: any) => {
  const query = `
    INSERT INTO GALERIA_MULTIMEDIA (
      id_usuario_autor, url_archivo, tipo_archivo, publicado, 
      id_torneo, id_partido, id_espacio, id_carrera
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
  `;
  const values = [
    data.id_usuario_autor,
    data.url_archivo,
    data.tipo_archivo,
    data.publicado ?? false,
    data.id_torneo || null,
    data.id_partido || null,
    data.id_espacio || null,
    data.id_carrera || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateMedia = async (id: number, data: any) => {
  const query = `
    UPDATE GALERIA_MULTIMEDIA 
    SET publicado = COALESCE($1, publicado),
        id_torneo = $2,
        id_partido = $3,
        id_espacio = $4,
        id_carrera = $5
    WHERE id_multimedia = $6 RETURNING *;
  `;
  const values = [
    data.publicado !== undefined ? data.publicado : null,
    data.id_torneo || null,
    data.id_partido || null,
    data.id_espacio || null,
    data.id_carrera || null,
    id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteMedia = async (id: number) => {
  const query = `DELETE FROM GALERIA_MULTIMEDIA WHERE id_multimedia = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rowCount ? result.rowCount > 0 : false;
};