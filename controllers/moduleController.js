const Module = require("../models/module");

const ModuleController = {
  async create(req, res) {
    try {
      const module = await Module.create(req.body);
      res.status(201).send({ msg: "módulo creado con éxito", module });
    } catch (error) {
      res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).send({ msg: "Módulo no encontrado" });
      res.send("Módulo actualizado con éxito");
    } catch (error) {
      res.status(500).send(error);
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Module.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).send({ msg: "Módulo no encontrado" });
      res.send("Módulo actualizado con éxito");
    } catch (error) {
      res.status(500).send(error);
    }
  },

  async getById(req, res) {
    try {
      const module = await Module.findById(req.params.id);
      if (!module) return res.status(404).send({ msg: "Módulo no encontrado" });
      res.send(module);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  async getByName(req, res) {
    try {
      const regex = new RegExp(req.params.name, "i");
      const module = await Module.find({ name: regex });
      res.send(module);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  async getAll(req, res) {
    try {
      const module = await Module.find().populate({
        path: "session",
        select: "name",
      });
      res.status(200).send(module);
    } catch (error) {
      res.status(500).send({
        message: "Ha habido un problema al traer la información de los módulos",
      });
    }
  },
};

module.exports = ModuleController;
