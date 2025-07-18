const Mentoring = require("../models/mentoring")

const mentoringController = {
    async getAll(req, res) {
        try {
            const mentoring = await Mentoring.find()
            res.status(200).send({mentoring})
        }catch (error) {
            console.error(error)
            res.status(500).send({msg: 'Error al obtener formadores'})
        }
    },
    async getById (req,res) {
          try {
            const mentoring = await Mentoring.findById(req.params._id);
             if (!mentoring) {
            return res.status(404).send({ msg: 'Mentor no encontrad@ con ese ID' });
            }
            res.status(200).send(mentoring)
          } catch (error) {
            console.error(error)
            res.status(500).send('Ha habido un error al buscar el/la mentor')
          }
    },
    async getByEmpresa(req, res) {
            try {
              const regex = new RegExp(req.params.company, "i");
              const mentoring = await Mentoring.find({ company: regex });
              res.send(mentoring);
            } catch (error) {
              console.error("Error en getByEmpresa mentoring:", error);
              res.status(500).send(error);
            }
          },
}

module.exports = mentoringController