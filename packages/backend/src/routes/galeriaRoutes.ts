import { Router } from 'express';
import * as galeriaController from '../controllers/galeriaController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', galeriaController.obtenerGaleria);

router.post('/', authenticateJWT, authorizeRoles('admin'), galeriaController.crearElementoGaleria);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), galeriaController.actualizarElementoGaleria);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), galeriaController.eliminarElementoGaleria);

export default router;