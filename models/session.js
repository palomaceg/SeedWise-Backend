const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Por favor introduce un título de la sesión"],
  },
  date: {
    type: date,
    require: [true, "Por favor introduce una fecha de la sesión"],
  },
  instructor: {
    type: String,
  },
  position: {
    type: String,
  },
  company: {
    type: String,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
  },
  material: {
    type: String,
  },
  survey: {
    type: String,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
