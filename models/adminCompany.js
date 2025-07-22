const mongoose = require("mongoose");

const adminCompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor introduce un nombre para la empresa"],
    },
    web: {
      type: String,
    },
    contact: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: {
        type: String,
      },
      coordinates: {
        type: [Number]
      },
    },
  },
  {
    timestamps: true,
    collection: "adminCompany",
  }
);

// companySchema.index({ location: "2dsphere" });

const adminCompany = mongoose.model('adminCompany', adminCompanySchema);
module.exports = adminCompany;
