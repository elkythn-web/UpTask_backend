import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailRecuperacion } from '../helpers/email.js';

// Registrar usuario
const registrar = async (req, res) => {
    // Evitar registros duplicados mediante email
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
        const error = new Error("El usuario ya existe");
        return res.status(400).json({ msg: error.message });
    }
    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        // Enviar email de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })

        res.json({ msg: "Usuario registrado correctamente, revisa ti correo para confirmar tu cuenta" });
    } catch (error) {
        console.log(error);
    }
}

// Autenticar usuario
const autenticar = async (req, res) => {
    // extraer el email y password
    const { email, password } = req.body;

    // comprobar que el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }
    // comprobar que el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("El usuario no esta confirmado");
        return res.status(401).json({ msg: error.message });
    }

    // comprobar que el password es correcto
    if (await usuario.compararPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(401).json({ msg: error.message });
    }
}

// Confirmar usuario
const confirmar = async (req, res) => {
    const { token } = req.params;
    const usuarioConfirmar = await Usuario.findOne({ token });
    if (!usuarioConfirmar) {
        const error = new Error("Token invalido");
        return res.status(403).json({ msg: error.message });
    }
    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        await usuarioConfirmar.save();
        res.json({ msg: "Usuario confirmado" });
    } catch (error) {
        console.log(error);
    }
}

// Olvide password
const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }
    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviar email de confirmacion
        emailRecuperacion({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })

        res.json({ msg: "Se ha enviado un correo para reestablecer el password" });
    } catch (error) {
        console.log(error);
    }
}

// Recuperar password del usuario
const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = Usuario.findOne({ token });
    if (tokenValido) {
        res.json({ msg: "Token valido" });
    } else {
        const error = new Error("Token invalido");
        return res.status(401).json({ msg: error.message });
    }
}


// Nuevo password
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });

    if(usuario) {
        usuario.password = password;
        usuario.token = '';
        try {
            await usuario.save();
            res.json({ msg: "Password actualizado" });
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error("Token invalido");
        return res.status(401).json({ msg: error.message });
    }
}

const perfil = async (req, res) => {
    const { usuario } = req;
    res.json(usuario);
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
}