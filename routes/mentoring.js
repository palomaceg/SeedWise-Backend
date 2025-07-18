const express = require('express');
const mentoringController = require('../controllers/mentoringController');
const router = express.Router();

router.get('/', mentoringController.getAll);
router.get('/id/:_id', mentoringController.getById);
router.get('/company/:company', mentoringController.getByEmpresa)

module.exports = router;