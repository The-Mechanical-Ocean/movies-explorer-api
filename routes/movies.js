const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?/),
    trailerLink: Joi.string().required().regex(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?/),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().regex(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?/),
    movieId: Joi.number().required(),
  }),
}), createMovie);

router.delete('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
