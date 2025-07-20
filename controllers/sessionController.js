const Session = require("../models/session.js");

const SessionController = {
  async create(req, res) {
    try {
      const create = await Session.create(req.body);
      res.status(201).send({ msg: "La sesión ha sido creada con éxito", create });
    } catch (error) {
      console.error("❌ Error al crear modulo:", error);
      res.status(500).send(error);
    }
  },

  async getAll(req, res) {
    try {
      const order = req.query.order === "desc" ? -1 : 1;
      const session = await Session.find().sort({ date: order });
      res.status(200).send(session);
    } catch (error) {
      console.error("❌ Error en getAll sessions:", error);
      res.status(500).send({
        message: "Ha habido un problema al traer la información de los módulos",
      });
    }
  },

  async getByTrainer(req, res) {
    try {
      const regex = new RegExp(req.params.name, "i");
      const session = await Session.find({ name: regex });
      res.send(session);
    } catch (error) {
      console.error("❌ Error en traer por formador:", error);
      res.status(500).send(error);
    }
  },

  async getByCompany(req, res) {
    try {
      const regex = new RegExp(req.params.company, "i");
      const session = await Session.find({ company: regex });
      res.send(session);
    } catch (error) {
      console.error("❌ Error en traer por formador:", error);
      res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const updated = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).send({ msg: "Sesión no encontrada" });
      res.send("Sesión actualizada con éxito");
    } catch (error) {
      console.error("❌ Error al actualizar la sesión:", error);
      res.status(500).send(error);
    }
  },
};

module.exports = SessionController;
