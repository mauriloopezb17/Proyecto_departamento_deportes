import { Router } from 'express';
import { obtenerEntrenadores, obtenerHorarios, obtenerGaleriaClub, obtenerEspacios } from '../controllers/infoController';

const router = Router();

router.get('/entrenadores', obtenerEntrenadores);
router.get('/horarios', obtenerHorarios);
router.get('/galeria-eventos', obtenerGaleriaClub);
router.get('/espacios', obtenerEspacios);

export default router;