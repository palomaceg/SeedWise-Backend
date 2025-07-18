const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema(
    {
        participant:{
            type: String,
            required: [true, 'Porfavor, introduce el nombre de tu Startup'],
        },
        description: {
            type: String,
            required: [true, 'Porfavor, introduce una breve descripción'],
        },
        sector: {
            type: String, 
            required: [true, 'Porfavor, introduce tu sección'],
        },
        web: {
            type: String,
            required: [true, 'Por favor, indícanos tu página web'],
        },
        stage: {
            type: String,
            required: [true, 'Por favor, rellena tu contraseña'],
        },
        roundsRaised: {
            type: String,
            required: [true, 'Por favor, índicanos tus rondas'],
        },
        recognitions: {
            type: String,
            required: [true, 'Por favor, índicanos tus reconocimientos'],
        },
        contact: {
            type: String,
            required: [true, 'Por favor, indícanos tu nombre'],
        },
        role: {
            type: String,
            required: [true, 'Por favor, indícanos tu puesto de trabajo en la startup'],
        },
        email: {
            type: String,
            match: [/^.*@.*\..*/, 'Este correo no es válido'],
            required: [true, 'Por favor, rellena tu email'],
        },
        submissionTime: {
            type: Date
        },
        respondent: {
            type: String
        },
         },
        {
            timestamps: true,
            collection: "startup",
        }

)

const startup = mongoose.model('startup', StartupSchema);

module.exports = startup;