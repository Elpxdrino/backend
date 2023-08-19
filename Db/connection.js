const mongoose = require('mongoose');
const express = require('express');

require('dotenv').config();

const app = express();

const Db = () => {
  mongoose
    .connect(process.env.mongoUrl)
    .then(() => {
      console.log('Connected to database');
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = Db;
