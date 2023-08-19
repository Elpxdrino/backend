const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const productionFunction = (err, res) => {
  if (err.operationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.statusCode,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
      code: 500,
    });
  }
};

const developmentFunction = (err, res) => {
  if (err.operationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.statusCode,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
      code: 500,
    });
  }
};

const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    productionFunction(err, res);
  } else if (process.env.NODE_ENV === 'development') {
    developmentFunction(err, res);
  }
};

module.exports = { errorMiddleware };
