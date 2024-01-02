const path = require('path');
const { User } = require('../../Models/User.model');
const bcrypt = require('bcrypt');
const { Dashboard } = require('../../Models/dashboard.model');
require('dotenv').config();

const { createToken } = require(path.join(
  __dirname,
  '..',
  '..',
  'Utils',
  'createToken'
));

const { tryCatch } = require(path.join(
  __dirname,
  '..',
  '..',
  'Utils',
  'try_catch'
));

const Register = tryCatch(async (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const userDB = await User.findOne({
    email: email,
  });

  if (userDB) {
    res.status(400).send({ msg: 'User already exist!' });
  } else {
    const addDashboard = new Dashboard({ email });

    addDashboard.save();

    const newUser = new User({
      fullName: name,
      email: email,
      password: hashedPassword,
    });

    newUser.save().then(() => {
      const token = createToken({
        name: newUser.email,
        id: newUser._id,
      });
      res.cookie('id', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        status: 'success',
        message: 'successfully registered',
        data: newUser,
      });
    });
  }
});

const Login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  const userDB = await User.findOne({ email });

  if (!userDB) {
    return res.status(401).send('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, userDB.password);

  if (!passwordMatches) {
    return res.status(401).send('Invalid email or password');
  }

  // SEND token
  const token = createToken({
    email: userDB.email,
    id: userDB._id,
    admin: userDB.admin,
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    status: 'success',
    message: 'successfully logged in',
    data: token,
    user: userDB,
  });
});

module.exports = {
  Register,
  Login,
};
