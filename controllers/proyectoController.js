import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: { $in: req.usuario } },
            { creador: { $in: req.usuario } }
        ]
    }).select("-tareas");

    res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;
    try {
        const proyectoGuardado = await proyecto.save()
        res.json(proyectoGuardado);
        res.json({ msg: "Proyecto creado correctamente" });
    } catch (error) {
        console.log(error);
    }
};

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
        .populate({
            path: 'tareas',
            populate: { path: 'completado', select: 'nombre' }
        })
        .populate('colaboradores', 'nombre email');

    if (!proyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()
        && !proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    res.json(proyecto);
};

const editarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoGuardado = await proyecto.save()
        res.json(proyectoGuardado);
    } catch (error) {
        console.log(error);
    }
};

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    try {
        await proyecto.deleteOne();
        res.json({ msg: "Proyecto eliminado" });
    } catch (error) {
        console.log(error);
    }
};

const buscarColaborador = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select("-password -__v -createdAt -updatedAt -confirmado -token ");

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    res.json(usuario);
};

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select("-password -__v -createdAt -updatedAt -confirmado -token ");

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    // Verificar si el usuario ya es el administrador del proyecto
    if (usuario._id.toString() === proyecto.creador.toString()) {
        const error = new Error("El usuario ya es el administrador del proyecto");
        return res.status(404).json({ msg: error.message });
    }

    // Verificar si el usuario ya es colaborador del proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El usuario ya es colaborador del proyecto");
        return res.status(404).json({ msg: error.message });
    }

    //Ya podemos agregar el colaborador al proyecto si paso todas las validaciones
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({ msg: "Colaborador agregado correctamente" });
};

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    //Ya podemos agregar el colaborador al proyecto si paso todas las validaciones
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({ msg: "Colaborador eliminado correctamente" });
};


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador,
}












