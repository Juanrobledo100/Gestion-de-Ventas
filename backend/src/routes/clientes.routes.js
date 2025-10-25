const express = require('express');
const router = express.Router();
const clienteCtrl = require('../controllers/cliente.controller');

router.get('/', clienteCtrl.getAll);
router.get('/:id', clienteCtrl.getById);
router.post('/', clienteCtrl.create);
router.put('/:id', clienteCtrl.update);
router.delete('/:id', clienteCtrl.remove);

module.exports = router;
