import { Router } from "express";
import { login, register, obtenerUsuarios, usuarioPorId, borrarPorId, actualizarPorId } from "../db/usuariosDB.js";
import { adminAutorizado, usuarioAutorizado } from "../middlewares/funcionesPassword.js";
const router = Router();

router.post("/registro", async(req, res)=>{
    const respuesta = await register(req.body);
    console.log(respuesta.mensajeOriginal);
    res.cookie("token", respuesta.token).status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.post("/login", async (req, res) => {
    const respuesta = await login(req.body);
    console.log(respuesta.mensajeOriginal);

    // Enviamos la respuesta al frontend
    res.cookie("token", respuesta.token).status(respuesta.status).json({
        estado: respuesta.status === 200, // Indica si el login fue exitoso
        tipoUsuario: respuesta.mensajeOriginal.tipoUsuario, // Incluimos el tipoUsuario
        mensaje: respuesta.mensajeUsuario, // Mensaje de bienvenida
    });
});

router.get("/usuarios", async (req, res) => {
    const respuesta = await obtenerUsuarios();
    res.status(respuesta.status).json({ mensaje: respuesta.mensajeUsuario, usuarios: respuesta.token });
});

router.get("/usuarioPorId/:id", async (req, res) => { 
    const { id } = req.params;  
    const respuesta = await usuarioPorId(id);
    res.status(respuesta.status).json({ mensaje: respuesta.mensajeUsuario, usuario: respuesta.token });
});

router.delete("/eliminarPorId/:id", async (req, res) => { 
    const { id } = req.params;  
    const respuesta = await borrarPorId(id);  
    res.status(respuesta.status).json(respuesta.mensajeUsuario); 
});

router.put("/actualizarPorId/:id", async (req, res) => {  
    const { id } = req.params; 
    const { username, email, password, tipoUsuario } = req.body; 
    const respuesta = await actualizarPorId({ id, username, email, password, tipoUsuario });
    res.status(respuesta.status).json(respuesta.mensajeUsuario); 
});


router.get("/salir", async(req, res)=>{
    res.cookie("token","",{expires : new Date(0)}).status(200).json("Sesion cerrada correctamente");
});

router.get("/usuariosLogueados", async (req, res) => {
    const respuesta = usuarioAutorizado(req.cookies.token, req);
    if (!respuesta.estado) {
        return res.status(respuesta.status).json(respuesta.mensajeUsuario);
    }
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.get("/administradores", async(req, res) => {
    const respuesta = await adminAutorizado(req); 
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
});


router.get("/cualquierUsuario", async(req, res)=>{
    res.json("Todos pueden entrar sin loguearse");
});

export default router;