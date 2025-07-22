const User = require('../models/user');
const Startup = require('../models/startup');
const Mentor = require('../models/trainer'); 
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); 

exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      role,
      password,
      firstName,
      lastName,
      phone,
      company, 
      description,
      sector,
      web,
      stage,
      roundsRaised,
      recognitions,
      contact,
      respondent,
      position,     
      linkedin,     
      studyProgram, 
      photo,        
      logo,         
      session_id,
    } = req.body;

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


    if (role === 'startup') {

      if (company && mongoose.Types.ObjectId.isValid(company)) {
        const existingStartup = await Startup.findById(company);
        if (!existingStartup) {
          return res.status(404).send({ msg: 'La startup seleccionada no existe en nuestra base de datos.' });
        }
        companyId = existingStartup._id;
        companyModel = 'startup';
      } else {
    
        if (!company || !description || !sector || !web) {
          return res.status(400).send({ msg: 'Faltan campos obligatorios para registrar una nueva startup (nombre de la startup, descripción, sector, web).' });
        }
        const newStartup = await Startup.create({
          company, 
          description,
          sector,
          web,
          stage,
          roundsRaised,
          recognitions,
          contact,
          email,
          role: 'startup', 
          submissionTime: new Date(),
          respondent
        });
        companyId = newStartup._id;
        companyModel = 'startup';
      }
    } else if (role === 'mentor') {
      
      if (!firstName || !lastName || !company || !position) {
        return res.status(400).send({ msg: 'Faltan campos obligatorios para el registro de mentor (nombre, apellido, empresa, puesto).' });
      }
      
      const fullName = `${firstName} ${lastName}`; 

      const newMentor = await Mentor.create({
        name: fullName, 
        position,
        company,
        linkedin,
        email,
        studyProgram,
        photo,
        logo,
        session_id,
 
      });
      companyId = newMentor._id;
      companyModel = 'mentoring'; 
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      role,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      company: companyId,     
      companyModel,           
      confirmed: true,       
    });

    res.status(201).send({ msg: 'Usuario y su entidad asociada (startup/mentor) creados con éxito.', user: newUser });
  } catch (error) {
    console.error('Error en registerUser:', error);
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).send({ msg: 'Datos de registro inválidos.', errors: errors });
    }
    res.status(500).send({ msg: 'Error interno del servidor durante el registro.', error: error.message });
  }
};