const express = require("express");
const router = express.Router();
const ModuleController = require("../controllers/moduleController");

router.post("/", ModuleController.create);
router.get("/", ModuleController.getAll);
router.get("/name/:name", ModuleController.getByTitle);

module.exports = router;
