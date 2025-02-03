import User from "../models/usuarioModelo.js";
import { encriptarPassword,validarPassword } from "../middlewares/funcionesPassword.js";
import { mensaje } from "../libs/mensajes.js";
import { crearToken } from "../libs/jwt.js";

export const register = async ({username, email, password})=>{
    try {
        const usuarioDuplicado = await User.findOne({username});
        const emailDuplicado = await User.findOne({email});
        if(usuarioDuplicado || emailDuplicado){
            return mensaje(400,"Usuario ya existente");
        }
        const{salt, hash} = encriptarPassword(password);
        const dataUser = new User({username, email, password:hash, salt});
        const respuestaMongo = await dataUser.save();
        const token = await crearToken({id:respuestaMongo._id});
        //console.log("Usuario guardado correctamente");
        return mensaje(200,"Usuario Registrado","",token);
    } catch (error) {
        return mensaje(400,"Error de Registro", error);
    }
};

export const login = async ({ username, password }) => {
    try {
        const usuarioEncontrado = await User.findOne({ username }); // Añadir await aquí
        if (!usuarioEncontrado) {
            return mensaje(400, "Datos incorrectos");
        }
        const passwordValido = validarPassword(password, usuarioEncontrado.salt, usuarioEncontrado.password); 
        if (!passwordValido) {
            return mensaje(400, "Datos incorrectos");
        }
        const token = await crearToken({ id: usuarioEncontrado._id });
        return mensaje(200, `Bienvenido ${usuarioEncontrado.username}`, "", token);
    } catch (error) {
        return mensaje(400, "Datos incorrectos", error);
    }
};



