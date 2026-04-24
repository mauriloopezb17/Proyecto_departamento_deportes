import express from 'express';
import cors from 'cors';
import passport  from 'passport';
import './config/passport';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

/*app.get('/api/auth/google', passport.authenticate('google',{scope: ['profile', 'email']}));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req: any, res) => {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      const data: any = await response.json();
      
      res.send(`
        <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
          <h1>yasta</h1>
          <p>Hola <b>${req.user.name || req.user.displayName}</b>, tu rol es: <b>${req.user.role}</b></p>
          <img src="${data.message}" style="max-width: 400px; border-radius: 10px; display: block; margin: 20px auto;">
        </div>
      `);
    } catch (e) {
      res.json(req.user);
    }
  }
);*/

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ados corriendose en http://localhost:${PORT}`);
  console.log(`OAuth2 para @ucb.edu.bo`);
});
app.get('/', (req, res) => {
  res.send('cristo viene');
});

