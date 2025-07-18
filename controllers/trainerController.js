const Trainer = require("../models/trainer")

const trainerController = {
    async getAll(req, res) {
        try {
            const trainer = await Trainer.find()
            res.status(200).send({trainer})
        }catch (error) {
            console.error(error)
            res.status(500).send({msg: 'Error al obtener formadores'})
        }
    },
    async getById (req,res) {
          try {
            const trainer = await Trainer.findById(req.params._id);
             if (!trainer) {
            return res.status(404).send({ msg: 'trainer no encontrad@ con ese ID' });
            }
            res.status(200).send(trainer)
          } catch (error) {
            console.error(error)
            res.status(500).send('Ha habido un error al buscar el/la trainer')
          }
    },
    async getByName(req, res) {
        try {
          const regex = new RegExp(req.params.name, "i");
          const trainer = await Trainer.find({ name: regex });
          res.send(trainer);
        } catch (error) {
          console.error("Error en getByName trainer:", error);
          res.status(500).send(error);
        }
      },
    async getByPosition(req, res) {
        try {
          const regex = new RegExp(req.params.position, "i");
          const trainer = await Trainer.find({ position: regex });
          res.send(trainer);
        } catch (error) {
          console.error("Error en getByPosition trainer:", error);
          res.status(500).send(error);
        }
      },
      async getByEmpresa(req, res) {
        try {
          const regex = new RegExp(req.params.company, "i");
          const trainer = await Trainer.find({ company: regex });
          res.send(trainer);
        } catch (error) {
          console.error("Error en getByEmpresa trainer:", error);
          res.status(500).send(error);
        }
      },
}

module.exports = trainerController