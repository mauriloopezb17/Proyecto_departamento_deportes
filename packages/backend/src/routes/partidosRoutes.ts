import { Router } from 'express';
import { obtenerResultadosRecientes, obtenerFixtureTorneo } from '../controllers/partidoController';

const router = Router();

router.get('/recientes', obtenerResultadosRecientes);
router.get('/fixture/:idTorneo', obtenerFixtureTorneo);

export default router;