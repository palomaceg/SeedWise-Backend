const adminCompany = require("../models/adminCompany.js");


const AdminCompanyController = {

  async getAll(req, res) {
    try {
      const companies = await adminCompany.find();
      res.status(200).send(companies);
    } catch (error) {
      console.error("❌ Error al traer empresas:", error);
      res.status(500).send({ msg: "Hubo un problema al traer las empresas" });
    }
  },

  async getById(req, res) {
    try {
      const company = await adminCompany.findById(req.params.id);
      if (!company) return res.status(404).send({ msg: "Empresa no encontrada con ese ID" });
      res.status(200).send(company);
    } catch (error) {
      console.error("❌ Error en getById empresa:", error);
      res.status(500).send({ msg: "Error al buscar la empresa por ID" });
    }
  },

};

module.exports = AdminCompanyController;