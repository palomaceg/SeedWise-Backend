const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, 'Porfavor, introduce tu nombre'],
            unique: true
        },
        lastname: {
            type: String,
            required: [true, 'Porfavor, ingresa tu Apellido'],
            unique: true
        },
        lastname2: {
            type: String, 
            unique: true
        },
        email: {
        type: String,
        match: [/^.*@.*\..*/, 'Este correo no es válido'],
        required: [true, 'Por favor, rellena tu email'],
        unique: true,
        },
        password: {
        type: String,
        required: [true, 'Por favor, rellena tu contraseña'],
         unique: true,
        },
        phone: {
            type: String,
            required: [true, 'Por favor, rellena tu télefono'],
            unique: true,
        },
        role: {
            type: String,
            enum: ['admin', 'mentor', 'startup'], 
            default:'startup'
        },
        company: {
            type: String,
            required: [true, 'Por favor, indícanos tu empresa'],
            unique: true
        },
        confirmed: {
        type: Boolean,
        default: false,
        },

    } 
)

const user = mongoose.model('user', UserSchema);

module.exports = user;