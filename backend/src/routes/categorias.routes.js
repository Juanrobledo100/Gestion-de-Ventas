const express = require('express');
const router = express.Router();
const catCtrl = require('../controllers/categoria.controller');

router.get('/', catCtrl.getAll);
router.get('/:id', catCtrl.getById);
router.post('/', catCtrl.create);
router.put('/:id', catCtrl.update);
router.delete('/:id', catCtrl.remove);

module.exports = router;
