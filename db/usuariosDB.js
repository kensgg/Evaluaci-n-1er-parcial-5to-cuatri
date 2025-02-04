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

export const obtenerUsuarios = async () => {
    try {
        const usuarios = await User.find(); 
        if (usuarios.length === 0) {
            return mensaje(404, "No hay usuarios registrados");
        }
        return mensaje(200, "Usuarios encontrados", "", usuarios);  
    } catch (error) {
        return mensaje(400, "Error al obtener los usuarios", error);
    }
};

export const usuarioPorId =  async (id) => {
    try {
        const usuario = await User.findById(id);
        if(!usuario){
            return mensaje(404, "No hay un usuario con ese id");
        }
        return mensaje(200, "Usuario encontrado", "", usuario);
    } catch (error) {
        return mensaje(400, "Error al obtener usuario", error);
    }
}

export const borrarPorId = async (id) => {  
    try {
        const usuario = await User.findById(id);
    if (!usuario) {
        return mensaje(400, "El usuario no existe");
    }
    const usuarioEliminado = await User.findByIdAndDelete(id);
    if(!usuarioEliminado) {
        return mensaje(404, "No se ha podido eliminar al usuario");
    }
    return mensaje(200, "Usuario borrado correctamente");
    } catch (error) {
        return mensaje(400, "No se ha podido eliminar al usuario", error);
    }
    
}

export const actualizarPorId = async ({ id, username, password }) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            return mensaje(400, "El usuario no existe");
        }

        const usuarioExistente = await User.findOne({ username });
        if (usuarioExistente && usuarioExistente._id.toString() !== id) {
            return mensaje(400, "El nombre de usuario ya está en uso");
        }

        if (password) {
            const { salt, hash } = encriptarPassword(password);
            usuario.password = hash;
            usuario.salt = salt;
        }

        if (username) {
            usuario.username = username;
        }

        const usuarioActualizado = await usuario.save();
        if (!usuarioActualizado) {
            return mensaje(404, "No se ha podido actualizar al usuario");
        }

        return mensaje(200, "Usuario actualizado correctamente");
    } catch (error) {
        return mensaje(400, "Error al actualizar al usuario", error);
    }
};

