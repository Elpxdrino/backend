const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    //   user
    email: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      default: '',
    },

    coin: {
      type: String,
      default: '',
    },

    method: {
      type: String,
      default: 'Bank Transfer',
    },

    details: {
      type: 
        {
          coin: String,
          addr: String,
          tag: String,
          network: String,
          
        },
    },

    note: {
      type: String,
      default: '',
    },

    pin: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      default: 'Not Paid',
    },

    amount: {
      type: Number,
      default: 0,
    },
    fees: {
      type: String,
      default: '',
    },
    received: {
      type: Number,
      default: '',
    },
    fees: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const History = mongoose.model('History', historySchema);

module.exports = {
  History,
};
