import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
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