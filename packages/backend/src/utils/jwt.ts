import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(
  path.join(__dirname, "../../private.pem"),
  "utf8",
);
const publicKey = fs.readFileSync(
  path.join(__dirname, "../../public.pem"),
  "utf8",
);

export const generateToken = (user: any) => {
  const payload = {
    id_usuario: user.id_usuario,
    email: user.email,
    id_rol: user.id_rol,
    nombre_rol: user.nombre_rol,
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: "8h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
};
