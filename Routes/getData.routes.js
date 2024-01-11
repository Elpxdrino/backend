const {
  getCoinData,
} = require('../Controllers/getDataController/getData.controller');
const Authenticate = require('../Middlewares/Authentication');

const dataRoute = require('express').Router();

dataRoute.get('/coins', Authenticate, getCoinData);

module.exports = {
  dataRoute,
};
