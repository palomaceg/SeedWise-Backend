const mongoose = require('mongoose');

const MentoringSchema = new mongoose.Schema (
    {
        name:{
            type: String,
            required: [true, 'Porfavor, indicanos tu nombre'],
        },
        company: {
            type: String,
            required: [true, 'Por favor, indícanos el nombre de tu empresa'],
        },
        position: {
            type: String,
            required: [true, 'Por favor, indicanos tu puesto de trabajo']
        },
        email: {
            type: String,
            match: [/^.*@.*\..*/, 'Este correo no es válido'],
            required: [true, 'Por favor, rellena tu email'],
        },
        availabilityDate: {
            type: Date,
            required: [true, 'Por favor, indícanos tu fecha de disponibilidad'],
        },
        linkedin: {
            type: String,
        },
        website: {
            type: String,
        },
        mentoringAreas: {
            type: String,
            required: [true, 'Por favor indícanos tus áreas de mentor']
        },
        logo: {
            type: String,
        },
        phone: {
            type: String,
        },
        managementLink: {
            type: String
        },
         },
        {
            timestamps: true,
            collection: "mentorship",
        }
)

const mentoring = mongoose.model('mentoring', MentoringSchema);
module.exports = mentoring;