const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { AppError } = require(path.join(__dirname, '..', 'Utils', 'appError'));

const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log('authorized');
      req.user = decoded;

      if (req.user.user.admin) {
        next();
      } else {
        res.status(401).json({ message: 'NotAdmin' });
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = isAdmin;
