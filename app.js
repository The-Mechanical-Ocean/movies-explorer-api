require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors, Joi, celebrate } = require('celebrate');
const auth = require('./middlewares/auth');
const { createUsers, login } = require('./controllers/users');
const NotFoundError = require('./errors/NotFound');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const { PORT = 3001, DATABASE = 'mongodb://127.0.0.1/moviesdb' } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

mongoose.connect(DATABASE);

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUsers);

app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundError('Извините, страница не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

app.listen(PORT);
