const express = require('express');
const router = express.Router();
const { inviteUser } = require('../controllers/inviteController');

router.post('/', inviteUser);

module.exports = router;