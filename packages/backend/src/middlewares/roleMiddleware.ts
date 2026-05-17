import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    // if (!user || !allowedRoles.includes(user.role)) {
    if (!user || !allowedRoles.includes(user.nombre_rol)) {
      return res.status(403).json({
        message: "No tienes permisos suficientes para realizar esta acción",
      });
    }
    next();
  };
};
