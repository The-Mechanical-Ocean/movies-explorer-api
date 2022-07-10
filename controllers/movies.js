const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequest');
const NotFoundError = require('../errors/NotFound');
const ForbiddenError = require('../errors/Forbidden');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .populate('owner')
    .then((movie) => res.send(movie))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailerLink, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введенные данные некорректны'));
        return;
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Карточка не найдена');
      }
      if (req.user._id === movie.owner.toString()) {
        Movie.findByIdAndRemove(req.params._id)
          .then(() => {
            res.send(movie);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('идентификатор неверен'));
              return;
            }
            next(err);
          });
        return;
      }
      throw new ForbiddenError('Невозможно удалить фильм других пользователей');
    })
    .catch((err) => next(err));
};
