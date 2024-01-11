const {
  decreAccount,
  increAccount,
  getUser,
  getDashBoardData,
  updateProfile,
  changePassword,
  getHistory,
  getWithdrawalHistory,
  approveWithdrawal,
  declineWithdrawal,
  getAllUser,
  changeBalance,
  deleteUser,
} = require('../Controllers/Admin/admin.controller');
const isAdmin = require('../Middlewares/isAdmin');

const adminRoute = require('express').Router();

adminRoute.post('/decrease', isAdmin, decreAccount);

adminRoute.post('/increase', isAdmin, increAccount);

adminRoute.post('/getUser', isAdmin, getUser);

adminRoute.get('/getDashBoardData', isAdmin, getDashBoardData);

adminRoute.post('/updateProfile', isAdmin, updateProfile);

adminRoute.post('/changePassword', isAdmin, changePassword);

adminRoute.post('/changeBalance', isAdmin, changeBalance);

adminRoute.post('/getHistory', isAdmin, getHistory);

adminRoute.get('/getWithdrawalRequest', isAdmin, getWithdrawalHistory)

adminRoute.put('/approveWithdrawal', isAdmin, approveWithdrawal)

adminRoute.put('/declineWithdrawal', isAdmin, declineWithdrawal)


adminRoute.get('/getAllUser', isAdmin, getAllUser);

adminRoute.post('/deleteUser', isAdmin, deleteUser);

module.exports = {
  adminRoute,
};
