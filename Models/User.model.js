const { bool } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      required: true,
    },

    admin: {
      type: Boolean,
      default: false,
    },

    amount: {
      type: Number,
      default: 0,
    },

    password: {
      type: String,
      default: '',
    },

    language: {
      type: String,
      default: 'ENG',
    },

    currency: {
      type: String,
      default: 'USD',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
