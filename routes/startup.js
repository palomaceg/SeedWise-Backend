const express = require('express');
const startupController = require('../controllers/startupController');
const router = express.Router();


router.get('/', startupController.getAll);
router.get('/:_id', startupController.getById);
router.get('/busqueda/:name', startupController.getByName);
router.get('/busqueda/sector/:sector', startupController.getBySector);

module.exports = router;