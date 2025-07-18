const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/', userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAll);

module.exports = router;