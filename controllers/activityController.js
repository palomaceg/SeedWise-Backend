const Activity = require('../models/activity');

const activityController = {

  async getAll(req, res) {
    try {
      const activities = await Activity.find();
      res.status(200).send(activities);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      res.status(500).send({ message: 'Error al obtener actividades' });
    }
  },

  async getById(req, res) {
    try {
      const activity = await Activity.findById(req.params._id);
      if (!activity) {
        return res.status(404).json({ message: 'Actividad no encontrada' });
      }
      res.status(200).send(activity);
    } catch (error) {
      console.error('Error al obtener la actividad:', error);
      res.status(500).send({ message: 'Error al obtener la actividad' });
    }
  },

};

module.exports = activityController;