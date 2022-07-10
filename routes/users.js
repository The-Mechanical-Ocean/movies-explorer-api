const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const {
  updateUserInfo,
  findUserMe,
} = require('../controllers/users');

router.get('/me', findUserMe);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
}), updateUserInfo);

module.exports = router;
