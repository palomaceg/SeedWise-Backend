const express = require("express");
const router = express.Router();
const ModuleController = require("../controllers/moduleController");

router.post("/", ModuleController.create);

module.exports = router;
