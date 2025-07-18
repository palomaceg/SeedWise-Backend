const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({_id: payload._id});
        req.user = user;
        next();
    } catch (error) {
        res.status(500).send({ msg: 'Ha habido un problema con el token', error})
    }
}

module.exports = {authentication};