import { Router } from 'express';
import { obtenerEntrenadores, obtenerHorarios, obtenerGaleriaClub } from '../controllers/infoController';

const router = Router();

router.get('/entrenadores', obtenerEntrenadores);
router.get('/horarios', obtenerHorarios);
router.get('/galeria-eventos', obtenerGaleriaClub);

export default router;