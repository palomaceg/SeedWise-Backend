const express = require("express");
const AdminCompanyController = require("../controllers/adminCompanyController");
const router = express.Router();

router.get("/companies", AdminCompanyController.getAll);
router.get("/companies/:id", AdminCompanyController.getById);


module.exports = router;