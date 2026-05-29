import { Router } from 'express';
import { obtenerDestacados } from '../controllers/deportistaController';

const router = Router();

router.get('/destacados', obtenerDestacados);

export default router;