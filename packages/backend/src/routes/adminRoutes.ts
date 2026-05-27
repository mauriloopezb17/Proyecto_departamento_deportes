import { Router } from 'express';
import { inscribirDeportista, obtenerCatalogosInscripcion, crearUsuario, listarRoles, listarCarreras, listarDeportistas } from '../controllers/adminController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get(
  '/catalogos/inscripcion',
  authenticateJWT,
  authorizeRoles('Administrador'),
  obtenerCatalogosInscripcion
);

router.post(
  '/deportistas/inscribir',
  authenticateJWT,
  authorizeRoles('Administrador'),
  inscribirDeportista
);

router.get(
  '/roles',
  authenticateJWT,
  authorizeRoles('Administrador'),
  listarRoles
);

router.post(
  '/usuarios/registrar',
  authenticateJWT,
  authorizeRoles('Administrador'),
  crearUsuario
);

router.get(
  '/carreras',
  authenticateJWT,
  authorizeRoles('Administrador'),
  listarCarreras
);

router.get(
  '/deportistas',
  authenticateJWT,
  authorizeRoles('Administrador'),
  listarDeportistas
);
export default router;