import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../config/db';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      
      if (!email) {
        return done(null, false, { message: 'No se pudo obtener el correo de Google' });
      }

      const result = await pool.query(`
        SELECT u.id_usuario, u.email, u.id_rol, r.nombre_rol, p.nombres, p.ape_paterno
        FROM USUARIOS u
        JOIN PERSONAS p ON u.id_persona = p.id_persona
        JOIN ROLES r ON u.id_rol = r.id_rol
        WHERE u.email = $1 AND u.activo = TRUE
      `, [email]);

      if (result.rows.length === 0) {
        console.log(`[AUTH] Intento de acceso denegado (No registrado): ${email}`);
        return done(null, false, { message: 'Cuenta no registrada en el sistema. Contacta al administrador.' });
      }

      const dbUser = result.rows[0];
      console.log(`[AUTH] Login exitoso con Google: ${email} | Rol: ${dbUser.nombre_rol}`); 
      
      return done(null, dbUser);

    } catch (error) {
      console.error('[AUTH] Error en Google Strategy:', error);
      return done(error, false);
    }
  }
));