const express = require('express');
const trainerController = require('../controllers/trainerController');
const router = express.Router();

router.get('/', trainerController.getAll)
router.get('/id/:_id', trainerController.getById);
router.get('/name/:name', trainerController.getByName);
router.get('/position/:position', trainerController.getByPosition);
router.get('/company/:company', trainerController.getByEmpresa);

module.exports = router;