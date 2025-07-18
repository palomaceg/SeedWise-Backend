const express = require('express');
const userController = require('../controllers/userController');
const { authentication } = require('../middleware/authentication');
const router = express.Router();

router.post('/', userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAll);
router.get('/:_id', userController.getById);
router.get('/busqueda/:email', userController.getByEmail);
router.put('/edit', authentication, userController.updateUser);
router.delete('/logout', authentication, userController.logout);
router.delete('/delete/:_id', authentication, userController.delete);

module.exports = router;