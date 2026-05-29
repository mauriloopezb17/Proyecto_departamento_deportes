import { Router } from 'express';
import passport from 'passport';
import { googleCallback, login, register, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Ruta de login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login?error=no_registrado`,
  }),
  googleCallback
);

// para hacer la prueba del funcionamiento del token
router.get('/prueba-grupos', authenticateJWT, async (req, res) => {
  try {
    const user: any = (req as any).user; 

    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data: any = await response.json();

    res.send(`
      <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
          <h1>yasta</h1>
          <p>Hola <b>${user.email}</b>, tu rol es: <b>${user.role}</b></p>
          <img src="${data.message}" style="max-width: 400px; border-radius: 10px; display: block; margin: 20px auto;">
        </div>
    `);
  } catch (error) {
    res.status(500).send('Error cargando la prueba');
  }
});

export default router;