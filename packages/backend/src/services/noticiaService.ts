import pool from "../config/db";
import { NoticiaData, NoticiaResponse } from "../types/noticia";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, CDN_PUBLIC_URL, OCI_NAMESPACE } from "../config/oracleStorage";
import fs from "fs";
import path from "path";
//noticia service 
async function subirTempAOCI(urlTemp: string): Promise<string> {
  const tempIdx = urlTemp.lastIndexOf('/temp/');
  const filename = urlTemp.substring(tempIdx + 6);
  const filepath = path.join(__dirname, '../../uploads/temp', filename);

  if (!fs.existsSync(filepath)) {
    throw new Error(`Archivo temporal no encontrado: ${filepath}`);
  }

  const buffer = fs.readFileSync(filepath);
  const ociFilename = `cms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: ociFilename,
    Body: buffer,
    ContentType: "image/webp",
  }));

  fs.unlinkSync(filepath);

  return `${CDN_PUBLIC_URL}/n/${OCI_NAMESPACE}/b/${BUCKET_NAME}/o/${ociFilename}`;
}

// ── Helper: recorre bloques, sube temps a OCI, actualiza URLs ─────────────────

async function procesarImagenesContenido(
  contenido: any,
  id_noticia: number,
  client: any,
): Promise<any> {
  if (!contenido?.blocks) return contenido;

  const blocks = await Promise.all(
    contenido.blocks.map(async (block: any) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const url = block.data.file.url;

        if (url.includes('/temp/')) {
          // Imagen nueva → subir a OCI
          console.log(`[TEMP] Procesando: ${url}`);
          const urlOCI = await subirTempAOCI(url);
          console.log(`[TEMP] Subido a OCI: ${urlOCI}`);

          await client.query(
            'INSERT INTO NOTICIAS_IMAGENES (id_noticia, url_storage, es_portada) VALUES ($1, $2, false)',
            [id_noticia, urlOCI],
          );

          return {
            ...block,
            data: { ...block.data, file: { ...block.data.file, url: urlOCI } },
          };
        } else {
          // Imagen ya en OCI → solo registrar en la tabla
          await client.query(
            'INSERT INTO NOTICIAS_IMAGENES (id_noticia, url_storage, es_portada) VALUES ($1, $2, false)',
            [id_noticia, url],
          );
          return block;
        }
      }
      return block;
    }),
  );

  return { ...contenido, blocks };
}



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

  if (soloPublicados) query += " WHERE n.publicado = TRUE";
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

  return { ...noticia, imagenes: imagenesResult.rows };
};

export const createNoticia = async (
  data: NoticiaData,
): Promise<{ id_noticia: number; contenido: any }> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fechaPublicacion = data.publicado ? new Date() : null;

    const noticiaResult = await client.query(
      `INSERT INTO NOTICIAS (
        id_usuario_autor, id_categoria_noticia, titulo, contenido,
        resumen, publicado, fecha_creacion, fecha_publicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING id_noticia`,
      [
        data.id_usuario_autor,
        data.id_categoria_noticia,
        data.titulo,
        JSON.stringify(data.contenido),
        data.resumen || null,
        data.publicado,
        fechaPublicacion,
      ],
    );

    const id_noticia = noticiaResult.rows[0].id_noticia;

    const contenidoFinal = await procesarImagenesContenido(data.contenido, id_noticia, client);

    await client.query(
      'UPDATE NOTICIAS SET contenido = $1 WHERE id_noticia = $2',
      [JSON.stringify(contenidoFinal), id_noticia],
    );

    if (data.imagenes && data.imagenes.length > 0) {
      for (const img of data.imagenes) {
        await client.query(
          "INSERT INTO NOTICIAS_IMAGENES (id_noticia, url_storage, es_portada) VALUES ($1, $2, $3)",
          [id_noticia, img.url_storage, img.es_portada],
        );
      }
    }

    await client.query("COMMIT");

    return { id_noticia, contenido: contenidoFinal };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateNoticia = async (id: number, data: Partial<NoticiaData>): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.id_categoria_noticia) {
      fields.push(`id_categoria_noticia = $${i++}`);
      values.push(data.id_categoria_noticia);
    }
    if (data.titulo) {
      fields.push(`titulo = $${i++}`);
      values.push(data.titulo);
    }
    if (data.resumen !== undefined) {
      fields.push(`resumen = $${i++}`);
      values.push(data.resumen);
    }
    if (data.publicado !== undefined) {
      fields.push(`publicado = $${i++}`);
      values.push(data.publicado);
      if (data.publicado) fields.push(`fecha_publicacion = NOW()`);
    }

    let contenidoFinal = data.contenido;
    if (data.contenido) {
      await client.query(
        'DELETE FROM NOTICIAS_IMAGENES WHERE id_noticia = $1 AND es_portada = false',
        [id],
      );

      contenidoFinal = await procesarImagenesContenido(data.contenido, id, client);

      fields.push(`contenido = $${i++}`);
      values.push(JSON.stringify(contenidoFinal));
    }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE NOTICIAS SET ${fields.join(", ")} WHERE id_noticia = $${i} RETURNING *`,
        values,
      );
    }

    if (data.imagenes) {
      await client.query(
        "DELETE FROM NOTICIAS_IMAGENES WHERE id_noticia = $1 AND es_portada = true",
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

    return contenidoFinal;
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

export const getNoticiasByUsuario = async (id_usuario: number): Promise<NoticiaResponse[]> => {
  const result = await pool.query(`
    SELECT n.*, c.nombre as categoria_nombre, p.nombres as autor_nombre, p.ape_paterno as autor_apellido
    FROM NOTICIAS n
    JOIN CATEGORIAS_NOTICIA c ON n.id_categoria_noticia = c.id_categoria_noticia
    JOIN USUARIOS u ON n.id_usuario_autor = u.id_usuario
    JOIN PERSONAS p ON u.id_persona = p.id_persona
    WHERE n.id_usuario_autor = $1
    ORDER BY n.fecha_creacion DESC
  `, [id_usuario]);

  return Promise.all(
    result.rows.map(async (noticia) => {
      const imgResult = await pool.query(
        "SELECT url_storage FROM NOTICIAS_IMAGENES WHERE id_noticia = $1 AND es_portada = TRUE LIMIT 1",
        [noticia.id_noticia],
      );
      return { ...noticia, imagen_portada: imgResult.rows[0]?.url_storage || null };
    }),
  );
};