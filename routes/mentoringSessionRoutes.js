const express = require("express");
const router = express.Router();
const controller = require("../controllers/mentoringSessionsController");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/mentor/:mentorId", controller.getByMentor);
router.get("/startup/:startupId", controller.getByStartup);
router.patch("/sign/startup/:id", controller.signByStartup);
router.patch("/sign/mentor/:id", controller.signByMentor);
router.get("/pdf/:id", controller.getPDF);

module.exports = router;
