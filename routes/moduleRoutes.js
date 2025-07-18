const express = require("express");
const router = express.Router();
const ModuleController = require("../controllers/moduleController");

router.post("/", ModuleController.create);
router.get("/", ModuleController.getAll);
router.get("/name/:name", ModuleController.getByTitle);
router.get("/id/:id", ModuleController.getById);
router.delete("/id/:id", ModuleController.delete);
router.put("/id/:id", ModuleController.update);

module.exports = router;
