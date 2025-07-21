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
    },
      async logout(req, res) {
        try {
          if(!req.user) {
            return res.status(401).send('No autorizado');
          }
          const token = req.headers.authorization?.replace('Bearer ', '');
          if (!token) {
            return res.status(400).send('Token no proporcionado')
          }
          await User.findByIdAndUpdate(req.user._id, {$pull: { token: token }}, {new: true});
          res.send('Desconectad@ con éxito.')
      } catch (error){
          console.error(error)
          res.status(500).send ('Ha habido un problema al desconectar al usuari@')
      }
    },

  async getById(req, res) {
    try {
      const user = await User.findById(req.params._id).populate({
        path: 'company',
      });

      if (!user) {
        return res.status(404).send({ msg: 'Usuari@ no encontrado' });
      }

      res.status(200).send(user);
    } catch (error) {
      console.error(error);
      res.status(500).send('Ha habido un error al buscar al usuari@');
    }
  },
    async updateUser (req, res) {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findByIdAndUpdate(req.body, payload._id);
        res.status(200).send(user)
      } catch (error) {
        console.error(error)
        res.status(500).send('No se ha podido modificar el usuario')
      }
    },
    async getByEmail(req, res) {
    try {
      const regex = new RegExp(req.params.email, "i");
      const user = await User.find({ email: regex });
      res.send(user);
    } catch (error) {
      console.error("Error en getByName modules:", error);
      res.status(500).send(error);
    }
  },
  async delete (req, res) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params._id);
      if (!deletedUser) {
        return res.status(404).send({ message: 'Usuari@ no encontrado para eliminar.' });
      }
      res.status(200).send({ message: 'Usuari@ eliminado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al eliminar el usuari@.' });
    }
  },
}

module.exports = userController