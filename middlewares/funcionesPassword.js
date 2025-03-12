import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { mensaje } from "../libs/mensajes.js";
import { isAdmin } from "../db/usuariosDB.js";

export function encriptarPassword(password) {
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return { salt, hash };
}

export function validarPassword(password, salt, hash) {
    const hashEvaluar = crypto.scryptSync(password, salt, 64).toString("hex");
    return hashEvaluar === hash;
}


export function usuarioAutorizado(token, req) {
    console.log(token)
    if (!token) {
        return mensaje(400, "Usuario no autorizado");
    }

    try {
        const usuario = jwt.verify(token, process.env.SECRET_TOKEN);
        req.usuario = usuario;
        return mensaje(200, "Usuario autorizado", usuario);
    } catch (error) {
        return mensaje(400, "Usuario no autorizado");
    }
}

export async function adminAutorizado(req) { 
    const respuesta = usuarioAutorizado(req.cookies.token, req);
    if (respuesta.status !== 200) {
        return mensaje(400, "Admin no autorizado");
    }
    if (!await isAdmin(req.usuario.id)) {  
        return mensaje(400, "Admin no autorizado");
    }
    return mensaje(200, "Admin autorizado");
}

