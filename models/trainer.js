const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema (
    {
        name:{
            type: String,
            required: [true, 'Porfavor, indicanos tu nombre'],
        },
        position: {
            type: String,
            required: [true, 'Porfavor, indicanos tu posición laboral'],
        },
        email: {
            type: String,
            match: [/^.*@.*\..*/, 'Este correo no es válido'],
            required: [true, 'Por favor, rellena tu email'],
        },
        company: {
            type: String,
            required: [true, 'Por favor, indícanos el nombre de tu empresa'],
        },
        linkedin: {
            type: String,
        },
        studyProgram: {
            type: String,
        },
        photo: {
            type: String,
        },
        logo: {
            type: String,
        },
        session_id: {
            type: String,
        },
         },
        {
            timestamps: true,
            collection: "trainer",
        }
)

const trainer = mongoose.model('trainer', TrainerSchema);
module.exports = trainer;