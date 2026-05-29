import pool from '../config/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const RESET_TOKEN_SECRET = process.env.JWT_SECRET!;

export const crearCodigoReset = async (email: string): Promise<string> => {
  const userResult = await pool.query(
    'SELECT id_usuario FROM USUARIOS WHERE email = $1 AND activo = TRUE',
    [email]
  );
  if (userResult.rows.length === 0) {

    return 'ok';
  }

  const codigo = crypto.randomInt(100000, 999999).toString();
  const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await pool.query(
    `UPDATE CODIGOS_RESET_PASSWORD SET usado = TRUE WHERE email = $1 AND usado = FALSE`,
    [email]
  );

  await pool.query(
    `INSERT INTO CODIGOS_RESET_PASSWORD (email, codigo, expira_en) VALUES ($1, $2, $3)`,
    [email, codigo, expiraEn]
  );

  return codigo;
};


export const validarCodigo = async (email: string, codigo: string): Promise<string | null> => {
  const result = await pool.query(
    `SELECT id FROM CODIGOS_RESET_PASSWORD
     WHERE email = $1 AND codigo = $2 AND usado = FALSE AND expira_en > NOW()`,
    [email, codigo]
  );

  if (result.rows.length === 0) return null;

  await pool.query(
    `UPDATE CODIGOS_RESET_PASSWORD SET usado = TRUE WHERE id = $1`,
    [result.rows[0].id]
  );

  const resetToken = jwt.sign(
    { email, purpose: 'password_reset' },
    RESET_TOKEN_SECRET,
    { expiresIn: '10m' }
  );

  return resetToken;
};

export const cambiarPassword = async (resetToken: string, nuevaPassword: string): Promise<boolean> => {
  let payload: any;
  try {
    payload = jwt.verify(resetToken, RESET_TOKEN_SECRET) as any;
  } catch {
    return false;
  }

  if (payload.purpose !== 'password_reset') return false;

  const hash = await bcrypt.hash(nuevaPassword, 10);
  const result = await pool.query(
    `UPDATE USUARIOS SET hash_password = $1 WHERE email = $2 AND activo = TRUE`,
    [hash, payload.email]
  );

  return (result.rowCount ?? 0) > 0;
};
