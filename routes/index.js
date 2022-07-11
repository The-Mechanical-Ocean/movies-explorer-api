const router = require('express').Router();
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFound');

router.use(require('./entrance'));

router.use(auth);
router.use(require('./users'));
router.use(require('./movies'));

router.use((req, res, next) => {
  next(new NotFoundError('Извините, страница не найдена'));
});

module.exports = router;
