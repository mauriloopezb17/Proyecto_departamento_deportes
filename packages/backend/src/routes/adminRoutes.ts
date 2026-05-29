import { Router } from 'express';
import { inscribirDeportista, obtenerCatalogosInscripcion, crearUsuario, listarRoles, listarCarreras, listarDeportistas, registrarHorarioEntrenamiento } from '../controllers/adminController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get(
  '/catalogos/inscripcion',
  authenticateJWT,
  authorizeRoles('admin'),
  obtenerCatalogosInscripcion
);

router.post(
  '/deportistas/inscribir',
  authenticateJWT,
  authorizeRoles('admin'),
  inscribirDeportista
);

router.get(
  '/roles',
  authenticateJWT,
  authorizeRoles('admin'),
  listarRoles
);

router.post(
  '/usuarios/registrar',
  authenticateJWT,
  authorizeRoles('admin'),
  crearUsuario
);

router.get(
  '/carreras',
  authenticateJWT,
  authorizeRoles('admin'),
  listarCarreras
);

router.get(
  '/deportistas',
  authenticateJWT,
  authorizeRoles('admin'),
  listarDeportistas
);

router.post(
  '/horarios/entrenamiento',
  authenticateJWT,
  authorizeRoles('admin'),
  registrarHorarioEntrenamiento
);
export default router;