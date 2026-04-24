import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';

export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Autenticación fallida' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Autenticación exitosa',
      token: token,
      user: user
    });

  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};