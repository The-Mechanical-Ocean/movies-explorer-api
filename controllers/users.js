const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequest');
const UnauthorizedError = require('../errors/Unauthorized');
const NotFoundError = require('../errors/NotFound');
const ConflictError = require('../errors/Conflict');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.findUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.createUsers = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then(() => res.status(201).send({
          name, email,
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequestError('Введенные данные некорректны'));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictError('пользователь с этим e-mail уже существует'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введенные данные некорректны'));
        return;
      }
      if (err.code === 11000) {
        next(new ConflictError('пользователь с этим e-mail уже существует'));
        return;
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }
      next(err);
    });
};
