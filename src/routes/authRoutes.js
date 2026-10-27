const { registerUser, loginUser } = require('../controllers/authController');
const express = require('express');
const router = express.Router();
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middlewares/validateMiddleware');


router.post('/register',registerValidator ,validate, registerUser);

router.post('/login', loginValidator, validate, loginUser);

module.exports = router;