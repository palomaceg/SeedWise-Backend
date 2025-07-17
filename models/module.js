const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Por favor introduce un título para el módulo"],
    },
    initialDate: {
      type: Date,
      require: [true, "Por favor introduce una fecha de inicio"],
    },
    finalDate: {
      type: Date,
      require: [true, "Por favor introduce una fecha de término"],
    },
    session: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    material: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Module", moduleSchema);
