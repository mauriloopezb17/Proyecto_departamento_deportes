import pool from "../config/db";
import { NoticiaData, NoticiaResponse } from "../types/noticia";

export const getAllNoticias = async (
  soloPublicados = false,
): Promise<NoticiaResponse[]> => {
  let query = `
    SELECT n.*, c.nombre as categoria_nombre, p.nombres as autor_nombre, p.ape_paterno as autor_apellido
    FROM NOTICIAS n
    JOIN CATEGORIAS_NOTICIA c ON n.id_categoria_noticia = c.id_categoria_noticia
    JOIN USUARIOS u ON n.id_usuario_autor = u.id_usuario
    JOIN PERSONAS p ON u.id_persona = p.id_persona
  `;

  if (soloPublicados) {
    query += " WHERE n.publicado = TRUE";
  }

  query += " ORDER BY n.fecha_creacion DESC";

  const result = await pool.query(query);

  const noticias = await Promise.all(
    result.rows.map(async (noticia) => {
      const imgResult = await pool.query(
        "SELECT url_storage FROM NOTICIAS_IMAGENES WHERE id_noticia = $1 AND es_portada = TRUE LIMIT 1",
        [noticia.id_noticia],
      );
      return {
        ...noticia,
        imagen_portada: imgResult.rows[0]?.url_storage || null,
      };
    }),
  );

  return noticias;
};

export const getNoticiaById = async (
  id: number,
): Promise<NoticiaResponse | null> => {
  const query = `
    SELECT n.*, c.nombre as categoria_nombre, p.nombres as autor_nombre, p.ape_paterno as autor_apellido
    FROM NOTICIAS n
    JOIN CATEGORIAS_NOTICIA c ON n.id_categoria_noticia = c.id_categoria_noticia
    JOIN USUARIOS u ON n.id_usuario_autor = u.id_usuario
    JOIN PERSONAS p ON u.id_persona = p.id_persona
    WHERE n.id_noticia = $1
  `;
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) return null;

  const noticia = result.rows[0];

  const imagenesResult = await pool.query(
    "SELECT url_storage, es_portada FROM NOTICIAS_IMAGENES WHERE id_noticia = $1",
    [id],
  );

  return {
    ...noticia,
    imagenes: imagenesResult.rows,
  };
};

export const createNoticia = async (data: NoticiaData): Promise<number> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const noticiaQuery = `
      INSERT INTO NOTICIAS (
        id_usuario_autor, id_categoria_noticia, titulo, contenido, 
        resumen, publicado, fecha_creacion, fecha_publicacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING id_noticia
    `;

    const fechaPublicacion = data.publicado ? new Date() : null;

    const noticiaResult = await client.query(noticiaQuery, [
      data.id_usuario_autor,
      data.id_categoria_noticia,
      data.titulo,
      JSON.stringify(data.contenido),
      data.resumen || null,
      data.publicado,
      fechaPublicacion,
    ]);

    const id_noticia = noticiaResult.rows[0].id_noticia;

    if (data.imagenes && data.imagenes.length > 0) {
      for (const img of data.imagenes) {
        await client.query(
          "INSERT INTO NOTICIAS_IMAGENES (id_noticia, url_storage, es_portada) VALUES ($1, $2, $3)",
          [id_noticia, img.url_storage, img.es_portada],
        );
      }
    }

    await client.query("COMMIT");
    return id_noticia;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateNoticia = async (id: number, data: Partial<NoticiaData>) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fields = [];
    const values = [];
    let i = 1;

    if (data.id_categoria_noticia) {
      fields.push(`id_categoria_noticia = $${i++}`);
      values.push(data.id_categoria_noticia);
    }
    if (data.titulo) {
      fields.push(`titulo = $${i++}`);
      values.push(data.titulo);
    }
    if (data.contenido) {
      fields.push(`contenido = $${i++}`);
      values.push(JSON.stringify(data.contenido));
    }
    if (data.resumen !== undefined) {
      fields.push(`resumen = $${i++}`);
      values.push(data.resumen);
    }
    if (data.publicado !== undefined) {
      fields.push(`publicado = $${i++}`);
      values.push(data.publicado);
      if (data.publicado) {
        fields.push(`fecha_publicacion = NOW()`);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      const query = `UPDATE NOTICIAS SET ${fields.join(", ")} WHERE id_noticia = $${i} RETURNING *`;
      await client.query(query, values);
    }

    if (data.imagenes) {
      await client.query(
        "DELETE FROM NOTICIAS_IMAGENES WHERE id_noticia = $1",
        [id],
      );
      for (const img of data.imagenes) {
        await client.query(
          "INSERT INTO NOTICIAS_IMAGENES (id_noticia, url_storage, es_portada) VALUES ($1, $2, $3)",
          [id, img.url_storage, img.es_portada],
        );
      }
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteNoticia = async (id: number) => {
  await pool.query("DELETE FROM NOTICIAS_IMAGENES WHERE id_noticia = $1", [id]);
  const result = await pool.query(
    "DELETE FROM NOTICIAS WHERE id_noticia = $1 RETURNING *",
    [id],
  );
  return result.rowCount ? result.rowCount > 0 : false;
};

export const getCategorias = async () => {
  const result = await pool.query(
    "SELECT * FROM CATEGORIAS_NOTICIA ORDER BY nombre ASC",
  );
  return result.rows;
};
