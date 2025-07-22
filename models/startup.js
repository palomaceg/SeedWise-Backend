    const mongoose = require('mongoose');

    const StartupSchema = new mongoose.Schema(
        {
            company:{
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
            },
            stage: {
                type: String,
            },
            roundsRaised: {
                type: String,
            },
            recognitions: {
                type: String,
            },
            contact: {
                type: String,
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