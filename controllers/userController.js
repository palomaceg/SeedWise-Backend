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
}

module.exports = userController