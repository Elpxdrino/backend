const {
  Register,
  Login,
} = require('../Controllers/AuthController/auth.controller');

const authRoute = require('express').Router();

authRoute.post('/signup', Register);
authRoute.post('/login', Login);

module.exports = {
  authRoute,
};
