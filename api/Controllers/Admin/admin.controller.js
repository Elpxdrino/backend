const { User } = require('../../Models/User.model');
const { Dashboard } = require('../../Models/dashboard.model');
const _ = require('lodash');
const { History } = require('../../Models/history.model');
const bcrypt = require('bcrypt');

const getUser = async (req, res) => {
  const { email } = req.body;
  const doc = await User.findOne({ email });

  if (!doc) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.send(doc);
};

const getAllUser = async (req, res) => {
  const doc = await User.find();

  if (!doc) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.send(doc);
};

const getHistory = async (req, res) => {
  const { email } = req.body;
  const doc = await History.find({ email });

  if (!doc) {
    return res.status(404).json({ message: 'History not found' });
  }

  res.send(doc);
};

const getWithdrawalHistory = async (req, res) => {
  const { email } = req.body;
  try {
    const doc = await History.find({
      type: "Withdrawal",
      status: "Pending"
    });


    if (!doc) {
      return res.status(404).json({ message: 'No Pending Withdrawals' });
    }

    res.send(doc);
  } catch {
    console.error(error);
    res.send(500).json({ error: "internal server error" });
  }
};

const approveWithdrawal = async (req, res) => {
  const { _id, received } = req.body
  if (!_id) {
    return res.status(400).send({ error: 'id is required' })
  }

  try {
    const history = await History.findOne({ _id });
    console.log(history.amount)
    if (!history) return res.status(404).send({ error: 'Request not found' })

    if (received) {
      await History.updateOne({ _id: _id }, { status: 'Paid', received: received });
    } else {
      await History.updateOne({ _id: _id }, { status: 'Paid', received: history.amount });
    }

    return res.status(200).send({ message: 'successful' });
  } catch {
    console.error(error);
    res.send(500).json({ error: "internal server error" });
  }
}

const declineWithdrawal = async (req, res) => {
  const { _id, note } = req.body
  if (!_id) {
    return res.status(400).send({ message: 'id is required' })
  }

  try {
    const history = await History.findOne({ _id });

    if (!history) return res.status(404).send({ message: 'Request not found' })

    // check if user dashboard exists
    const doc = await Dashboard.findOne({ email: history.email });
    if (!doc) return res.status(404).json({ message: "Dashboard does not exist" });

    // check if user has enough amount for coin 
    const existingIndex = doc.walletAddress.findIndex((w) => w.coin == history.coin);
    if (existingIndex === -1) {
      doc.walletAddress.push({
        coin: history.coin,
        amount: history.amount,
      });
    } else {
      // deduct withdrawn amount
      doc.walletAddress[existingIndex].amount += Number(history.amount);
    }

    await doc.save()

    if (note) {
      await History.updateOne({ _id: _id }, { status: 'Declined', note: note });
    } else {
      await History.updateOne({ _id: _id }, { status: 'Declined', note: "" });
    }

    return res.status(200).send({ message: 'successful' });
  } catch {
    console.error(error);
    res.send(500).json({ error: "internal server error" });
  }
}

const getDashBoardData = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(500).send('Error occured');
  }

  const doc = await Dashboard.findOne({ email });

  if (!doc) {
    return res.status(404).json({ message: 'Watchlist not found' });
  }

  res.send(doc);
};

const increAccount = async (req, res) => {
  const { amount, email } = req.body;

  try {
    const UserDB = await User.findOne({ email });

    console.log(UserDB.amount);

    if (UserDB) {
      const updatedAmount = await User.findOneAndUpdate(
        { email },
        { $inc: { amount: Number(amount) } },
        { new: true }
      );

      const addHistory = new History({
        email,
        type: 'Deposit',
        amount,
        coin: 'USD',
        fees: '0',
        status: 'Paid',
        received: amount,
        method: 'admin',
      });

      addHistory.save();

      console.log(addHistory);

      const doc = await Dashboard.findOne({ email });

      res.send(updatedAmount);
    } else {
      res.status(400).send({ msg: 'User does not exist' });
    }

    //   res.send(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const decreAccount = async (req, res) => {
  const { amount, email } = req.body;

  try {
    const UserDB = await User.findOne({ email });

    console.log(UserDB.amount);

    if (UserDB) {
      const updatedAmount = await User.findOneAndUpdate(
        { email },
        { $inc: { amount: -Number(amount) } },
        { new: true }
      );

      const addHistory = new History({
        email,
        type: 'Withdrawal',
        amount,
        coin: 'USD',
        fees: '0',
        status: 'Paid',
        received: amount,
        method: 'admin',
      });

      addHistory.save();

      console.log(addHistory);

      const doc = await Dashboard.findOne({ email });

      res.send(updatedAmount);
    } else {
      res.status(400).send({ msg: 'User does not exist' });
    }

    //   res.send(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const updateProfile = async (req, res) => {
  const { userDetails, email } = req.body;

  // Create a new object with only the non-blank fields from the request body
  const updatedUserDetails = {};
  if (userDetails.fullName !== '')
    updatedUserDetails.fullName = userDetails.fullName;
  if (userDetails.language !== '')
    updatedUserDetails.language = userDetails.language;
  if (userDetails.currency !== '')
    updatedUserDetails.currency = userDetails.currency;

  // Update the user document with the non-blank fields
  User.findOneAndUpdate({ email }, { $set: updatedUserDetails }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error updating user');
    });
};

const changePassword = async (req, res) => {
  const { password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  User.findOneAndUpdate(
    { email },
    { $set: { password: hashedPassword } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error changing password');
    });
};

const changeBalance = async (req, res) => {
  const { amount, email } = req.body;

  User.findOneAndUpdate({ email }, { $set: { amount } }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);

      const addHistory = new History({
        email,
        type: 'manual',
        amount,
        coin: 'USD',
        fees: '0',
        status: 'Paid',
        received: amount,
        method: 'admin',
      });

      addHistory.save();

      console.log(addHistory);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error changing balance');
    });
};

const deleteUser = async (req, res) => {
  const { amount, email } = req.body;

  try {
    const UserDB = await User.findOne({ email });

    if (UserDB) {
      const doc = await User.deleteOne({ email });

      const history = await History.deleteMany({ email });

      const dash = await Dashboard.findOne({ email });

      res.send(doc);
    } else {
      res.status(400).send({ msg: 'User does not exist' });
    }

    //   res.send(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

module.exports = {
  increAccount,
  decreAccount,
  getDashBoardData,
  updateProfile,
  getUser,
  changePassword,
  getHistory,
  getWithdrawalHistory,
  approveWithdrawal,
  declineWithdrawal,
  getAllUser,
  changeBalance,
  deleteUser,
};
