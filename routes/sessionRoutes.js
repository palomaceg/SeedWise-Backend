const express = require("express");
const SessionController = require("../controllers/sessionController");
const router = express.Router();

router.post("/", SessionController.create);
router.get("/", SessionController.getAll);
router.get("/:id", SessionController.getById);
router.get("/trainer/:trainer", SessionController.getByTrainer);
router.get("/company/:company", SessionController.getByCompany);
router.put("/id/:id", SessionController.update);

module.exports = router;
