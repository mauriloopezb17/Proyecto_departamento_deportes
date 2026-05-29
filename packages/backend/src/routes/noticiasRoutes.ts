import { Router } from "express";
import * as noticiaController from "../controllers/noticiaController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
//noticia routes
const router = Router();

// pa todos
router.get("/", noticiaController.getNoticias);
router.get("/categorias", noticiaController.getCategorias);
router.get("/:id", noticiaController.getNoticia);

// pal admin
/*router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  noticiaController.createNoticia,
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  noticiaController.updateNoticia,
);*/
router.post("/", noticiaController.createNoticia);
router.put("/:id", noticiaController.updateNoticia);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  noticiaController.deleteNoticia,
);
router.get("/usuario/:id_usuario", noticiaController.getNoticiasByUsuario);

export default router;
