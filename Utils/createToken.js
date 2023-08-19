const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const jwt = require('jsonwebtoken');

const createToken = (user) => {
  const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: '1d' });
  return token;
};

module.exports = {
  createToken,
};
