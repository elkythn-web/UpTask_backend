import express from 'express'
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
} from '../controllers/tareaController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

//Ruta para agregar tareas
router.post('/', checkAuth, agregarTarea)

//Rutas para agregar, obtener, editar y eliminar tareas
router
    .route('/:id')
    .get(checkAuth, obtenerTarea)
    .put(checkAuth, actualizarTarea)
    .delete(checkAuth, eliminarTarea)

//Ruta para cambiar el estado de una tarea
router.post('/estado/:id', checkAuth, cambiarEstado)

export default router