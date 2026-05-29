import pool from '../config/db';

export const getJugadoresDestacados = async () => {
  const query = `
    SELECT 
        d.id_deportista,
        p.nombres, 
        p.ape_paterno, 
        p.ape_materno, 
        d.url_foto, 
        di.nombre_disciplina, 
        c.nombre_categoria
    FROM REGISTROS_FEDERACION rf
    JOIN DEPORTISTAS d ON rf.id_deportista = d.id_deportista
    JOIN PERSONAS p ON d.id_persona = p.id_persona
    JOIN DISCIPLINAS di ON rf.id_disciplina = di.id_disciplina
    LEFT JOIN CATEGORIAS c ON rf.id_categoria = c.id_categoria
    ORDER BY p.nombres ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};