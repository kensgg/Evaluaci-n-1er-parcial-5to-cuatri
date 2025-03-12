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

router.get("/usuariosLogueados", (req, res) => {
    const token = req.cookies.token;  // Extraemos el token desde la cookie

    console.log("Token recibido desde la cookie:", token);  // Verifica que estás recibiendo el token

    if (!token) {
        return res.status(400).json({ mensaje: "Token no proporcionado" });
    }

    // Llamamos a la función usuarioAutorizado para verificar el token
    const respuesta = usuarioAutorizado(token, req);
    
    if (respuesta.status === 200) {
        // Si la validación fue exitosa, accedemos al usuario autorizado desde `req.usuario`
        console.log("Usuario autorizado:", req.usuario);  // Verifica que el usuario está siendo correctamente decodificado
        return res.json({
            mensaje: "Usuario logueado correctamente",
            usuario: req.usuario,  // Aquí devolvemos los datos del usuario
        });
    } else {
        // Si no está autorizado, devolvemos el mensaje de error
        return res.status(400).json({ mensaje: "Usuario no autorizado" });
    }
});


router.get("/administradores", async(req, res) => {
    const respuesta = await adminAutorizado(req); 
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
});


router.get("/cualquierUsuario", async(req, res)=>{
    res.json("Todos pueden entrar sin loguearse");
});

export default router;