const express = require('express');
const router = express.Router();
const plantillasController = require('../controllers/plantillasController');

/**
 * @route   GET /api/plantillas
 * @desc    Listar todas las plantillas disponibles
 * @access  Public
 */
router.get('/', plantillasController.listarPlantillas);

/**
 * @route   GET /api/plantillas/:id/rellenar?cliente_id=1&contrato_id=2
 * @desc    Obtener plantilla rellenada con datos del cliente (y opcionalmente contrato)
 * @access  Public
 */
router.get('/:id/rellenar', plantillasController.rellenarPlantilla);

/**
 * @route   GET /api/plantillas/:id
 * @desc    Obtener contenido de una plantilla específica
 * @access  Public
 */
router.get('/:id', plantillasController.obtenerPlantilla);

module.exports = router;
