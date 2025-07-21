const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/', activityController.getAll);
router.get('/:_id', activityController.getById);

module.exports = router;