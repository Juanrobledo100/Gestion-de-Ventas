const express = require('express');
const router = express.Router();
const productoCtrl = require('../controllers/producto.controller');

router.get('/', productoCtrl.getAll);
router.get('/:id', productoCtrl.getById);
router.post('/', productoCtrl.create);
router.put('/:id', productoCtrl.update);
router.delete('/:id', productoCtrl.remove);

module.exports = router;
