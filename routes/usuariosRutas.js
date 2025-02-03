import { Router } from "express";
import { login, register } from "../db/usuariosDB.js";
const router = Router();

router.post("/registro", async(req, res)=>{
    const respuesta = await register(req.body);
    console.log(respuesta.mensajeOriginal);
    res.cookie("token", respuesta.token).status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.post("/login", async(req, res)=>{
    const respuesta =  await login(req.body);
    console.log(respuesta.mensajeOriginal);
    res.cookie("token", respuesta.token).status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.get("/salir", async(req, res)=>{
    res.json("Adios, Estás en salir");
});

router.get("/usuariosLogueados", async(req, res)=>{
    res.json("Usuarios convencionales y administradores logueados");
});

router.get("/administradores", async(req, res)=>{
    res.json("Solo administradores logueados");
});

router.get("/cualquierUsuario", async(req, res)=>{
    res.json("Todos pueden entrar sin loguearse");
});

export default router;