import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// verificar el directorio donde este la llave publica
const publicKey = fs.readFileSync(path.join(__dirname, '../config/public.pem'), 'utf8');

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // formato de Bearer token
    const token = authHeader.split(' ')[1];

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }

      (req as any).user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
  }
};