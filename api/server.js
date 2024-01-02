const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const Db = require(path.join(__dirname, 'Db', 'connection'));

const { app } = require(path.join(__dirname, 'app'));

Db();

const PORT = process.env.PORT || 5000;

app.listen(PORT);
