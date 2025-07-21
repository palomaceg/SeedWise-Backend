const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    schedule: {
      type: String,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
    attendance: {
      type: String,
    },
    format: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'activity', 
  }
);

const activity = mongoose.model('activity', activitySchema);
module.exports = activity;