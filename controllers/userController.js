require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

const userController = {
     async register(req, res) {
    try {
      if (!req.body.password) {
        return res.status(400).send('La contraseña es obligatoria');
      }
      const password = bcrypt.hashSync(req.body.password, 10);
      const user = await User.create({ ...req.body, password });
      res.status(201).send({ msg: 'Bienvenid@!', user });
    } catch (error) {
      console.log(error);
    }
  },
    async getAll(req, res) {
      try {
        const users = await User.find()
        res.status(200).send({users})
      }catch (error) {
        console.error(error)
        res.status(500).send({msg: 'Error al obtener usuarios'})
      }
    },
    async login(req, res) {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.status(400).send('Usuari@ y/o contraseña incorrectos');
        }
        if (!user.confirmed) {
          return res.status(400).send('Debes confirmar tu correo');
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
          return res.status(400).send('Usuari@ y/o contraseña incorrectos')
        }
        const token = jwt.sign({ _id: user._id}, JWT_SECRET);
        if (user.token.length > 4) user.token.shift();
        user.token.push(token);
        await user.save();
        res.status(200).send({ msg: `Bienvenid@ ${user.firstName}`, user, token })
      } catch (error) {
        console.error(error);
        res.status(500).send('Error en el login');
      }
    }
}

module.exports = userController