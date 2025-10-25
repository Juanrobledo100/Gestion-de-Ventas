const express = require('express');
const router = express.Router();
const ventaCtrl = require('../controllers/venta.controller');

router.get('/', ventaCtrl.getAll);
router.get('/:id', ventaCtrl.getById);
router.post('/', ventaCtrl.create);
router.delete('/:id', ventaCtrl.remove);

// agregaciones
router.get('/reportes/por-mes', ventaCtrl.ventasPorMes);
router.get('/reportes/por-categoria', ventaCtrl.ventasPorCategoria);
router.get('/reportes/top-productos', ventaCtrl.topProductos);

module.exports = router;
