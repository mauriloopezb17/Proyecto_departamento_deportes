import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { crearCodigoReset, validarCodigo, cambiarPassword } from '../services/passwordResetService';
import { sendPasswordResetCode } from '../utils/email';

export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user;
    const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

    if (!user) {
      return res.redirect(`${frontendURL}/login?error=no_registrado`);
    }

    const token = generateToken(user);
    return res.redirect(`${frontendURL}/auth/callback?token=${token}`);

  } catch (error) {
    console.error('Error en callback:', error);
    const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return res.redirect(`${frontendURL}/login?error=server_error`);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

  try {
    const result = await pool.query(`
      SELECT u.id_usuario, u.email, u.hash_password, u.id_rol, r.nombre_rol, p.nombres, p.ape_paterno
      FROM USUARIOS u
      JOIN PERSONAS p ON u.id_persona = p.id_persona
      JOIN ROLES r ON u.id_rol = r.id_rol
      WHERE u.email = $1 AND u.activo = TRUE
    `, [email]);

    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.hash_password);

    if (!isValidPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = generateToken(user);
    const userResponse = {
      id_usuario: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
      nombre_rol: user.nombre_rol,
      nombres: user.nombres,
      ape_paterno: user.ape_paterno
    };

    res.json({ message: 'Inicio de sesión exitoso', token, user: userResponse });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const register = async (req: Request, res: Response) => {
  const { 
    nombres, ape_paterno, ape_materno, fecha_nacimiento, celular, ci, complemento,
    email, password, id_rol
  } = req.body;

  if (!nombres || !ape_paterno || !fecha_nacimiento || !celular || !ci || !email || !password || !id_rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const personaResult = await client.query(`
      INSERT INTO PERSONAS (nombres, ape_paterno, ape_materno, fecha_nacimiento, celular, ci, complemento)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_persona
    `, [nombres, ape_paterno, ape_materno || '', fecha_nacimiento, celular, ci, complemento || null]);

    const id_persona = personaResult.rows[0].id_persona;

    const saltRounds = 10;
    const hash_password = await bcrypt.hash(password, saltRounds);

    await client.query(`
      INSERT INTO USUARIOS (id_persona, id_rol, email, hash_password, activo)
      VALUES ($1, $2, $3, $4, TRUE)
    `, [id_persona, id_rol, email, hash_password]);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El correo electrónico o Carnet de Identidad ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  } finally {
    client.release();
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo es obligatorio' });

  try {
    const codigo = await crearCodigoReset(email);
    if (codigo !== 'ok') {
      await sendPasswordResetCode(email, codigo);
    }
    // Siempre respondemos igual para no revelar si el email existe
    res.json({ message: 'Si el correo está registrado, recibirás un código en tu bandeja.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, codigo } = req.body;
  if (!email || !codigo) return res.status(400).json({ error: 'Correo y código son obligatorios' });

  try {
    const resetToken = await validarCodigo(email, codigo);
    if (!resetToken) {
      return res.status(400).json({ valid: false, error: 'Código inválido o expirado' });
    }
    res.json({ valid: true, reset_token: resetToken });
  } catch (error) {
    console.error('Error en verify-reset-code:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { reset_token, nueva_password } = req.body;
  if (!reset_token || !nueva_password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }
  if (nueva_password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const ok = await cambiarPassword(reset_token, nueva_password);
    if (!ok) {
      return res.status(400).json({ error: 'Token inválido, expirado o usuario no encontrado' });
    }
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};