const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  //   user
  email: {
    type: String,
    required: true,
  },

  addr: {
    type: String,
    default: '',
  },

  country: {
    type: String,
    default: '',
  },

  city: {
    type: String,
    default: '',
  },

  walletAddress: {
    type: [
      {
        coin: String,
        addr: String,
        tag: String,
        network: String,
        amount: Number,
      },
    ],
    default: [
      {
        coin: 'ETH',
        addr: '',
        tag: '',
        network: '',
        amount: 0,
      },
    ],
  },

  watchlist: {
    type: [String],
    default: '',
  },

  //   bank
  bank: {
    type: String,
    default: '',
  },
  bank_addr: {
    type: String,
    default: '',
  },
  bank_city: {
    type: String,
    default: '',
  },
  bank_country: {
    type: String,
    default: '',
  },
  bank_acctNum: {
    type: String,
    default: '',
  },
  bank_code: {
    type: String,
    default: '',
  },
  full_name:{
    type: String,
  }
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = {
  Dashboard,
};
