import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// las llaves deben estar en la raiz del proyecto
// la privada solo para el microserivicio de autenticaci´on (grupo 1)
const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8');
// la publica para todos los microservicios
const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8');

export const generateToken = (user: any) => {
  const payload = {
    id: user.googleId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '8h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};