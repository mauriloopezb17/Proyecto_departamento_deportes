import { Router } from "express";
import * as noticiaController from "../controllers/noticiaController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

// pa todos
router.get("/", noticiaController.getNoticias);
router.get("/categorias", noticiaController.getCategorias);
router.get("/:id", noticiaController.getNoticia);

// pal admin
/*router.post(
  "/",
  authenticateJWT,
  authorizeRoles("Administrador"),
  noticiaController.createNoticia,
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("Administrador"),
  noticiaController.updateNoticia,
);*/
router.post("/", noticiaController.createNoticia);
router.put("/:id", noticiaController.updateNoticia);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("Administrador"),
  noticiaController.deleteNoticia,
);

export default router;
