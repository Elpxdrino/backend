const { User } = require('../../Models/User.model');
const { Dashboard } = require('../../Models/dashboard.model');
const _ = require('lodash');
const { History } = require('../../Models/history.model');

const { Client, resources } = require('coinbase-commerce-node');

Client.init(String(process.env.COINBASE_API));
const { Charge } = resources;

const getUser = async (req, res) => {
  const doc = await User.findOne({ email: req.user.user.email });

  if (!doc) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.send(doc);
};

const getDashBoardData = async (req, res) => {
  const email = req.user.user.email;

  if (!email) {
    res.status(500).send('Error occured');
  }

  const doc = await Dashboard.findOne({ email });

  if (!doc) {
    return res.status(404).json({ message: 'Watchlist not found' });
  }

  res.send(doc);
};

const addWalletAddress = async (req, res) => {
  const { walletAddress } = req.body;
  const email = req.user.user.email;

  if (!email) {
    res.status(500).send('Error occured');
  }

  try {
    const doc = await Dashboard.findOne({ email });

    if (!doc) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    for (let i = 0; i < walletAddress.length; i++) {
      const existingIndex = doc.walletAddress.findIndex(
        (w) => w.coin === walletAddress[i].coin
      );

      if (existingIndex !== -1) {
        // Update existing wallet address if it already exists
        doc.walletAddress[existingIndex].addr = walletAddress[i].addr;
        doc.walletAddress[existingIndex].tag = walletAddress[i].tag;
      } else {
        // Add new wallet address if it doesn't exist
        walletAddress[i].amount = 0;
        doc.walletAddress.push(walletAddress[i]);
      }
    }

    await doc.save();

    res.send(doc);
  } catch (error) {
    console.error(error);
    // res.sendStatus(500);
  }
};

const addWatchList = async (req, res) => {
  const { watchlist } = req.body;
  const email = req.user.user.email;

  try {
    const doc = await Dashboard.findOne({ email });

    if (!doc) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    for (let i = 0; i < watchlist.length; i++) {
      doc.watchlist.push(watchlist[i]);
      await doc.save();
    }

    res.send(doc);

    //   res.send(201);
  } catch (error) {
    console.error(error);
    // res.sendStatus(500);
  }
};

const removeWatchListItem = async (req, res) => {
  const { coinNum } = req.body;
  const email = req.user.user.email;

  try {
    const doc = await Dashboard.findOne({ email });

    if (!doc) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    for (let i = 0; i < coinNum.length; i++) {
      doc.watchlist.pull(coinNum[i]);
      await doc.save();
    }

    await doc.save();

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error encountered' });
  }
  _;
};

const fundAccount = async (req, res) => {
  const { amount, crypto, method, status, type, fees, coin } = req.body;
  const email = req.user.user.email;

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
        type,
        amount,
        coin,
        fees,
        status,
        received: Number(amount) - Number(fees),
        method,
      });

      addHistory.save();

      console.log(addHistory);

      const doc = await Dashboard.findOne({ email });

      if (!doc) {
        return res.status(404).json({ message: 'Watchlist not found' });
      }

      const existingIndex = doc.walletAddress.findIndex((w) => w.coin == coin);

      if (existingIndex !== -1) {
        // Update existing wallet address if it already exists

        doc.walletAddress[existingIndex].amount += crypto;
      } else {
        // Add new wallet address if it doesn't exist
        doc.walletAddress.push({
          coin: crypto,
          amount,
        });
      }

      console.log(doc);

      await doc.save();

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

const withdraw = async (req, res) => {
  const { method, pin, amount, coin } = req.body;
  const email = req.user.user.email;

  if (isNaN(amount)) return res.status(400).json({ message: "Invalid withdrawal amount" })

  try {
    // check if user exists 
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "user does not exist" })

    // check if user dashboard exists
    const doc = await Dashboard.findOne({ email });
    if (!doc) return res.status(404).json({ message: "Dashboard does not exist" });

    // check if user has enough amount for coin 
    const existingIndex = doc.walletAddress.findIndex((w) => w.coin == coin);
    if (existingIndex === -1) return res.status(400).json({ message: "User's balance for coin is 0, fund wallet to make withdrawal" })

    // check if wallet has enough 
    const wallet = doc.walletAddress[existingIndex]
    if (Number(amount) > wallet.amount) return res.status(400).json({ message: "Insufficient balance to make withdrawal" })


    // deduct withdrawn amount
    doc.walletAddress[existingIndex].amount -= Number(amount);
    await doc.save()

    // add to history 
    await new History({
      email, 
      type: "Withdrawal",
      amount,
      coin: coin,
      status: 'Pending',
      method,
    }).save();

    return res.status(200).json({ message: "Request for withdrawal received, await payout" })
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const updateBank = async (req, res) => {
  const { bankDetails } = req.body;
  const email = req.user.user.email;

  // Create a new object with only the non-blank fields from the request body
  const updatedBankDetails = {};
  if (bankDetails.bank !== '') updatedBankDetails.bank = bankDetails.bank;
  if (bankDetails.bank_addr !== '')
    updatedBankDetails.bank_addr = bankDetails.bank_addr;
  if (bankDetails.bank_city !== '')
    updatedBankDetails.bank_city = bankDetails.bank_city;
  if (bankDetails.bank_country !== '')
    updatedBankDetails.bank_country = bankDetails.bank_country;
  if (bankDetails.bank_acctNum !== '')
    updatedBankDetails.bank_acctNum = bankDetails.bank_acctNum;
  if (bankDetails.bank_code !== '')
    updatedBankDetails.bank_code = bankDetails.bank_code;
  if (bankDetails.country !== '')
    updatedBankDetails.country = bankDetails.country;
  if (bankDetails.addr !== '') updatedBankDetails.addr = bankDetails.addr;
  if (bankDetails.city !== '') updatedBankDetails.city = bankDetails.city;

  // Update the user document with the non-blank fields
  Dashboard.findOneAndUpdate(
    { email },
    { $set: updatedBankDetails },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error updating user');
    });
};

const updateProfile = async (req, res) => {
  const { userDetails } = req.body;
  const email = req.user.user.email;

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

const coinInitRoute = async (req, res) => {
  const { product } = req.body;

  try {
    const userDB = await User.findOne({ _id: product.id });

    const chargeData = {
      name: product.name,
      description: product.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: product.price,
        currency: product.currency,
      },
      metadata: {
        id: userDB._id,
        amount: Number(product.price),
        crypto: product.price,
        method: product.method,
        status: 'created',
        type: product.type,
        fees: Number(product.price) * 0.01,
        coin: product.coin,
        redirect_url: product.redirect_url,
        cancel_url: product.cancel_url,
      },
    };

    const charge = await Charge.create(chargeData);

    res.send(charge);
  } catch (e) {
    res.status(500).send({ error: e });
  }
};

const getHistory = async (req, res) => {
  const email = req.user.user.email
  const doc = await History.find({ email });

  if (!doc) {
    return res.status(404).json({ message: 'History not found' });
  }

  res.send(doc.reverse());
};

module.exports = {
  addWatchList,
  fundAccount,
  removeWatchListItem,
  addWalletAddress,
  updateBank,
  getDashBoardData,
  updateProfile,
  getUser,
  coinInitRoute,
  getHistory,
  withdraw,
};
