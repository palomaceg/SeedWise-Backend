const Session = require("../models/session.js");

const SessionController = {
  async create(req, res) {
    try {
      const create = await Session.create(req.body);
      res.status(201).send({ msg: "La sesión ha sido creada con éxito", create });
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
