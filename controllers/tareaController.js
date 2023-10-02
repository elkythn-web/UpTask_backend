import Tarea from '../models/Tarea.js';
import Proyecto from '../models/Proyecto.js';
import mongoose from 'mongoose';

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;
    const existeProyecto = await Proyecto.findById(proyecto);

    if (!existeProyecto) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver este proyecto");
        return res.status(401).json({ msg: error.message });
    }

    try {
        // Verificar si el _id está presente en req.body
        if (!req.body._id) {
            // Si no está presente, genera un nuevo ObjectId
            req.body._id = new mongoose.Types.ObjectId();
        }

        const tareaGuardada = await Tarea.create(req.body);
        existeProyecto.tareas.push(tareaGuardada._id);
        await existeProyecto.save();
        res.json(tareaGuardada);
    } catch (error) {
        console.error(error);
        // Manejar errores adecuadamente
        res.status(500).json({ msg: "Hubo un error al guardar la tarea" });
    }
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
        const error = new Error("La tarea no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver esta tarea");
        return res.status(403).json({ msg: error.message });
    }
    res.json(tarea);
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
        const error = new Error("La tarea no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver esta tarea");
        return res.status(403).json({ msg: error.message });
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.estado = req.body.estado || tarea.estado;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;

    try {
        const tareaGuardada = await tarea.save()
        res.json(tareaGuardada);
    } catch (error) {
        console.log(error);
    }
};

const eliminarTarea = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
        const error = new Error("La tarea no existe");
        return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes permiso para ver esta tarea");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id);
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        res.json({ msg: "Tarea eliminada" });
    } catch (error) {
        console.log(error);
    }
};

const cambiarEstado = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
        const error = new Error("La tarea no existe");
        return res.status(404).json({ msg: error.message });
    }

    // Verificar que el usuario sea el creador del proyecto o el colaborador
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()
        && !tarea.proyecto.colaboradores.some(
            (colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("No tienes permiso para ver esta tarea");
        return res.status(403).json({ msg: error.message });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Proyecto.findById(id)
        .populate('tareas')
        .populate('completado')

    res.json(tareaAlmacenada);
};


export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}