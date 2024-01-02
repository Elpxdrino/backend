const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    //   user
    email: {
      type: String,
      required: true,
    },

    coin: {
      type: String,
      default: '',
    },

    method: {
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
  },
  { timestamps: true }
);

const History = mongoose.model('History', historySchema);

module.exports = {
  History,
};
