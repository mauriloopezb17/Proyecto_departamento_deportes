import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL,
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0].value;
    if (!email?.endsWith('@ucb.edu.bo')) {
      console.log(`[AUTH] Intento de acceso denegado para: ${email}`);
      return done(null, false, { message: 'Solo se permiten correos de la UCB' });
    }
    const role = 'estudiante'; 
    console.log(`...................logim`);
    console.log(`Usuario: ${profile.displayName}`);
    console.log(`Email: ${email}`);
    console.log(`Rol asignado: ${role}`); 
    
    const user = {
      googleId: profile.id,
      name: profile.displayName,
      email: email,
      picture: profile.photos?.[0].value,
      role: role
    };
    return done(null, user);
  }
));
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});