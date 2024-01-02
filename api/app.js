const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authRoute } = require('./Routes/auth.routes');
const { dataRoute } = require('./Routes/getData.routes');
const cors = require('cors');
const { userRoute } = require('./Routes/user.routes');
const { adminRoute } = require('./Routes/admin.route');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { errorMiddleware } = require(path.join(
  __dirname,
  'Middlewares',
  'errorHandling.middleware'
));

const app = express();
app.use(cors());

app.use(express.json()).use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.raw({ type: 'application/pdf', limit: '10mb' }));
app.use(bodyParser.json());

app.use('/pent/auth/', authRoute);
app.use('/pent/data/', dataRoute);
app.use('/pent/user/', userRoute);
app.use('/pent/admin/', adminRoute);

app.use(errorMiddleware);

module.exports = {
  app,
};
