const mongoose = require('mongoose');
const Startup = require("../models/startup")

const startupController = {
    async getAll(req, res) {
        try {
            const startup = await Startup.find()
            res.status(200).send({startup})
        }catch (error) {
            console.error(error)
            res.status(500).send({msg: 'Error al obtener startups'})
        }
    },
    async getById (req,res) {
          try {
            const startup = await Startup.findById(req.params._id);
             if (!startup) {
            return res.status(404).send({ msg: 'Startup no encontrada con ese ID' });
            }
            res.status(200).send(startup)
          } catch (error) {
            console.error(error)
            res.status(500).send('Ha habido un error al buscar la startup')
          }
    },
    async getByName(req, res) {
        try {
          const regex = new RegExp(req.params.company, "i");
          const startup = await Startup.find({ company: regex });
          res.send(startup);
        } catch (error) {
          console.error("Error en getByName modules:", error);
          res.status(500).send(error);
        }
      },
      async getBySector(req, res) {
        try {
          const regex = new RegExp(req.params.sector, "i");
          const startup = await Startup.find({ sector: regex });
          res.send(startup);
        } catch (error) {
          console.error("Error en getBySector modules:", error);
          res.status(500).send(error);
        }
      },
}

module.exports = startupController