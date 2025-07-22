const User = require('../models/user');
const Startup = require('../models/startup'); // Tu modelo Startup
const Mentor = require('../models/trainer');   // Modelo Trainer, que usas para Mentor
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Importamos mongoose para ObjectId.isValid

exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      role,
      password,
      firstName,
      lastName,
      phone,
      // 'company' puede ser el ID de una startup existente o el nombre de una nueva startup/empresa de mentor.
      company, // Este campo es clave y es el que viene del frontend
      // Campos específicos para la creación de una NUEVA startup (si aplica)
      description,
      sector,
      web,
      stage,
      roundsRaised,
      recognitions,
      contact,
      respondent,
      // Campos específicos para el registro de mentor (Trainer)
      position,     // Para el modelo Trainer
      linkedin,     // Para el modelo Trainer
      studyProgram, // Para el modelo Trainer (si se envía desde el frontend)
      photo,        // Para el modelo Trainer (si se envía desde el frontend)
      logo,         // Para el modelo Trainer (si se envía desde el frontend)
      session_id,   // Para el modelo Trainer (si se envía desde el frontend)
    } = req.body;

    // 1. Validaciones iniciales de campos de usuario
    if (!email || !role || !password || !firstName || !lastName || !phone) {
      return res.status(400).send({ msg: 'Faltan campos obligatorios para el usuario (email, rol, contraseña, nombre, apellido, teléfono).' });
    }

    if (!['startup', 'mentor'].includes(role)) {
      return res.status(400).send({ msg: 'Rol de usuario inválido. Debe ser "startup" o "mentor".' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ msg: 'Ya existe un usuario registrado con este correo electrónico.' });
    }

    let companyId = null;
    let companyModel = null;

    // 2. Lógica específica para el rol (Startup o Mentor)
    if (role === 'startup') {
      // Lógica para manejar si se selecciona una startup existente o se crea una nueva.
      // Si 'company' es un ID de MongoDB válido, buscamos una startup existente.
      if (company && mongoose.Types.ObjectId.isValid(company)) {
        const existingStartup = await Startup.findById(company);
        if (!existingStartup) {
          return res.status(404).send({ msg: 'La startup seleccionada no existe en nuestra base de datos.' });
        }
        companyId = existingStartup._id;
        companyModel = 'startup';
      } else {
        // Si 'company' NO es un ID válido, asumimos que es el nombre de una NUEVA startup a crear.
        // Validar campos obligatorios para la creación de una NUEVA startup.
        if (!company || !description || !sector || !web) {
          return res.status(400).send({ msg: 'Faltan campos obligatorios para registrar una nueva startup (nombre de la startup, descripción, sector, web).' });
        }
        const newStartup = await Startup.create({
          company, // Este es el nombre de la nueva startup (tu modelo Startup usa 'company')
          description,
          sector,
          web,
          stage,
          roundsRaised,
          recognitions,
          contact,
          email,
          role: 'startup', // El rol dentro de la tabla 'startup' si lo usas
          submissionTime: new Date(),
          respondent
        });
        companyId = newStartup._id;
        companyModel = 'startup';
      }
    } else if (role === 'mentor') {
      // Lógica para registrar un nuevo mentor (Trainer)
      // 'company' para el mentor es el nombre de su empresa (string), no un ID
      // Validamos que los campos necesarios para el modelo Trainer estén presentes
      if (!firstName || !lastName || !company || !position) {
        return res.status(400).send({ msg: 'Faltan campos obligatorios para el registro de mentor (nombre, apellido, empresa, puesto).' });
      }
      
      const fullName = `${firstName} ${lastName}`; // Concatena nombre y apellido para el campo 'name' del Trainer

      const newMentor = await Mentor.create({
        name: fullName, // Aquí se usa el campo 'name' del modelo Trainer
        position,
        company,
        linkedin,
        email,
        // Incluye los campos adicionales del modelo Trainer si se envían desde el frontend
        studyProgram,
        photo,
        logo,
        session_id,
        // Si tu modelo Trainer tiene un campo 'role', asegúrate de que sea 'mentor'
        // role: 'mentor', 
      });
      companyId = newMentor._id;
      companyModel = 'mentoring'; // Asegúrate de que este 'mentoring' coincide con el 'enum' en tu modelo User
    }

    // 3. Crear el Usuario final
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      role,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      company: companyId,     // ID de la empresa/startup asociada
      companyModel,           // Nombre del modelo de la empresa/startup ('startup' o 'mentoring')
      confirmed: true,        // Si el registro desde la invitación implica confirmación directa
    });

    res.status(201).send({ msg: 'Usuario y su entidad asociada (startup/mentor) creados con éxito.', user: newUser });
  } catch (error) {
    console.error('Error en registerUser:', error);
    // Manejo de errores específicos de validación de Mongoose
    if (error.name === 'ValidationError') {
        // Mongoose ValidationErrors tienen una estructura 'errors'
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).send({ msg: 'Datos de registro inválidos.', errors: errors });
    }
    // Otros errores internos del servidor
    res.status(500).send({ msg: 'Error interno del servidor durante el registro.', error: error.message });
  }
};