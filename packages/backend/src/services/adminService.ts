import pool from '../config/db';
import bcrypt from 'bcrypt';


export const inscribirDeportistaExterno = async (data: any) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const personaRes = await client.query(`
      INSERT INTO PERSONAS (nombres, ape_paterno, ape_materno, fecha_nacimiento, celular, ci, complemento)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_persona
    `, [
      data.deportista.nombres, data.deportista.ape_paterno, data.deportista.ape_materno,
      data.deportista.fecha_nacimiento, data.deportista.celular, data.deportista.ci, data.deportista.complemento
    ]);
    const idPersona = personaRes.rows[0].id_persona;
    
    const hashPassword = await bcrypt.hash(data.deportista.ci.toString(), 10);
    await client.query(`
      INSERT INTO USUARIOS (id_persona, id_rol, email, hash_password, activo)
      VALUES ($1, 4, $2, $3, TRUE)
    `, [idPersona, data.deportista.email, hashPassword]);
    
    let idPersonaTutor = null;
    if (data.tutor && data.tutor.nombres) {
      const tutorRes = await client.query(`
        INSERT INTO PERSONAS (nombres, ape_paterno, ape_materno, fecha_nacimiento, celular, ci, complemento)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_persona
      `, [
        data.tutor.nombres, data.tutor.ape_paterno, data.tutor.ape_materno,
        data.tutor.fecha_nacimiento, data.tutor.celular, data.tutor.ci, data.tutor.complemento
      ]);
      idPersonaTutor = tutorRes.rows[0].id_persona;

      if (data.tutor.email) {
        const hashPassTutor = await bcrypt.hash(data.tutor.ci.toString(), 10);
        await client.query(`
          INSERT INTO USUARIOS (id_persona, id_rol, email, hash_password, activo)
          VALUES ($1, 4, $2, $3, TRUE)
        `, [idPersonaTutor, data.tutor.email, hashPassTutor]);
      }
    }
    
    const deportistaRes = await client.query(`
      INSERT INTO DEPORTISTAS (id_persona, id_persona_tutor, tipo_deportista, talla_ropa)
      VALUES ($1, $2, 'Externo', $3) RETURNING id_deportista
    `, [idPersona, idPersonaTutor, data.deportista.talla_ropa]);
    const idDeportista = deportistaRes.rows[0].id_deportista;

    await client.query(`
      INSERT INTO DEPORTISTAS_EXTERNOS (id_deportista, colegio_instituto, curso)
      VALUES ($1, $2, $3)
    `, [idDeportista, data.deportista.colegio_instituto, data.deportista.curso]);
    
    await client.query(`
      INSERT INTO INSCRIPCIONES (id_deportista, id_disciplina, id_categoria, fecha_inscripcion, estado)
      VALUES ($1, $2, $3, CURRENT_DATE, 'Activo')
    `, [idDeportista, data.inscripcion.id_disciplina, data.inscripcion.id_categoria]);

    if (data.ficha_medica && data.ficha_medica.tipo_sangre) {
      await client.query(`
        INSERT INTO FICHAS_MEDICAS (
          id_deportista, tipo_sangre, seguro_medico, enfermedades_padecimientos, 
          contacto_emergencia_nombre, contacto_emergencia_telefono
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        idDeportista, data.ficha_medica.tipo_sangre, data.ficha_medica.seguro_medico || null,
        data.ficha_medica.enfermedades_padecimientos || null, 
        data.ficha_medica.contacto_emergencia_nombre, data.ficha_medica.contacto_emergencia_telefono
      ]);
    }

    if (data.experiencias && Array.isArray(data.experiencias) && data.experiencias.length > 0) {
      for (const exp of data.experiencias) {
        await client.query(`
          INSERT INTO HISTORIAL_EXPERIENCIA_DEPORTIVA (
            id_deportista, tipo_participacion, gestion, club_sede, categoria_jugada
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          idDeportista, exp.tipo_participacion, exp.gestion, exp.club_sede, exp.categoria_jugada || null
        ]);
      }
    }

    await client.query('COMMIT');
    return { success: true, message: 'Deportista inscrito correctamente', id_deportista: idDeportista };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const registrarUsuarioSistema = async (data: any) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const personaRes = await client.query(`
      INSERT INTO PERSONAS (nombres, ape_paterno, ape_materno, fecha_nacimiento, celular, ci, complemento)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_persona
    `, [
      data.nombres, data.ape_paterno, data.ape_materno || '', 
      data.fecha_nacimiento, data.celular, data.ci, data.complemento || null
    ]);
    const idPersona = personaRes.rows[0].id_persona;

    const hashPassword = await bcrypt.hash(data.ci.toString(), 10);

    const usuarioRes = await client.query(`
      INSERT INTO USUARIOS (id_persona, id_rol, email, hash_password, activo)
      VALUES ($1, $2, $3, $4, TRUE) RETURNING id_usuario
    `, [idPersona, data.id_rol, data.email, hashPassword]);
    
    const idUsuario = usuarioRes.rows[0].id_usuario;

    if (data.id_rol === 3) {
      await client.query(`
        INSERT INTO DELEGADOS_CARRERA (id_usuario, id_carrera, gestion, activo)
        VALUES ($1, $2, $3, TRUE)
      `, [idUsuario, data.id_carrera, data.gestion]);
    }

    await client.query('COMMIT');
    return { success: true, message: 'Usuario registrado exitosamente en el sistema' };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getCatalogosFormulario = async () => {
  const [disciplinasRes, categoriasRes] = await Promise.all([
    pool.query('SELECT id_disciplina, nombre_disciplina FROM DISCIPLINAS WHERE activo = TRUE ORDER BY nombre_disciplina ASC'),
    pool.query('SELECT id_categoria, nombre_categoria FROM CATEGORIAS ORDER BY nombre_categoria ASC')
  ]);

  return {
    disciplinas: disciplinasRes.rows,
    categorias: categoriasRes.rows
  };
};

export const obtenerTodosLosRoles = async () => {
  const query = 'SELECT id_rol, nombre_rol, descripcion FROM ROLES ORDER BY id_rol ASC;';
  const result = await pool.query(query);
  return result.rows;
};

export const getCarreras = async () => {
  const query = 'SELECT id_carrera, nombre, sigla FROM CARRERAS WHERE activo = TRUE ORDER BY nombre ASC;';
  const result = await pool.query(query);
  return result.rows;
};

export const getListaDeportistas = async () => {
  const query = `
    SELECT 
      d.id_deportista,
      p.nombres,
      p.ape_paterno,
      p.ape_materno,
      p.ci,
      p.complemento,
      p.celular,
      d.tipo_deportista,
      d.talla_ropa,
      i.fecha_inscripcion,
      i.estado AS estado_inscripcion,
      di.nombre_disciplina,
      c.nombre_categoria
    FROM DEPORTISTAS d
    JOIN PERSONAS p ON d.id_persona = p.id_persona
    LEFT JOIN INSCRIPCIONES i ON d.id_deportista = i.id_deportista
    LEFT JOIN DISCIPLINAS di ON i.id_disciplina = di.id_disciplina
    LEFT JOIN CATEGORIAS c ON i.id_categoria = c.id_categoria
    ORDER BY i.fecha_inscripcion DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const crearHorarioEntrenamiento = async (data: any) => {
  const query = `
    INSERT INTO PLANTILLA_HORARIOS_FIJOS (
      id_espacio, 
      id_disciplina, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      id_tipo_bloqueo, 
      id_entrenador
    ) 
    VALUES (
      $1, 
      $2, 
      $3, 
      $4, 
      $5, 
      (SELECT id_tipo_bloqueo FROM TIPOS_BLOQUEO WHERE nombre_bloqueo = 'Entrenamiento' LIMIT 1), 
      $6
    ) RETURNING *;
  `;
  
  const values = [
    data.id_espacio,
    data.id_disciplina,
    data.dia_semana,     
    data.hora_inicio,     
    data.hora_fin,        
    data.id_entrenador   
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const alternarEstadoDeportista = async (idDeportista: number) => {
  const query = `
    UPDATE INSCRIPCIONES
    SET estado = CASE
        WHEN estado = 'Activo' THEN 'Abandono'
        WHEN estado = 'Abandono' THEN 'Desactivado'
        WHEN estado IN ('Desactivado', 'Desactivo', 'Baja') THEN 'Activo'
        ELSE 'Activo' -- Valor por defecto si hubiera algún otro texto
    END
    WHERE id_deportista = $1
    RETURNING id_inscripcion, id_deportista, estado;
  `;
  
  const result = await pool.query(query, [idDeportista]);
  return result.rows;
};