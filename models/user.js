const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: [true, 'Porfavor, introduce tu nombre'],
        },
        lastName: {
            type: String,
            required: [true, 'Porfavor, ingresa tu Apellido'],
        },
        secondLastName: {
            type: String, 
        },
        email: {
        type: String,
        match: [/^.*@.*\..*/, 'Este correo no es válido'],
        required: [true, 'Por favor, rellena tu email'],
        },
        password: {
        type: String,
        required: [true, 'Por favor, rellena tu contraseña'],
        },
        phone: {
            type: String,
            required: [true, 'Por favor, rellena tu télefono'],
        },
        role: {
            type: String,
            enum: ['admin', 'mentor', 'startup'], 
            default:'startup'
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'companyModel', // referencia dinámica
            required: [true, 'Por favor, indícanos tu empresa'],
        },
        companyModel: {
            type: String,
            required: true,
            enum: ['startup', 'mentoring', 'adminCompany'], //modelo, no el rol
        },
        confirmed: {
        type: Boolean,
        default: false,
        },
        token: [],
         },
        {
            timestamps: true,
            collection: "user",
        }

)

const user = mongoose.model('user', UserSchema);

module.exports = user;