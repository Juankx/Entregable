const express = require('express');
const router = express.Router();
const controller = require('../controllers/postventaVitacoraController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', controller.list);
router.get('/plantilla-72h', controller.getPlantilla72h);
router.post('/', controller.create);
router.patch('/:id', controller.update);

module.exports = router;
