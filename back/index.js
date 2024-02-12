require('dotenv').config();

const Update = require('./import');
const mongoose = require('mongoose');
const express = require('express');
const getUpdateById = require('./routes/getUpdateById');
const getGameByID = require('./routes/getGameById');
const getGameByName = require('./routes/getGameByName');
const postRecc = require('./routes/postRecc');
const healthcheck = require('./routes/healthcheck');

const PORT = process.env.PORT || 3001;
const MONGODB_URL = process.env.MONGO || 'mongodb://localhost:27017/gamr';

var status = 'working';

setInterval(update, 24 * 3.6e6);

async function update() {
  if (status !== 'updating') {
    status = 'updating';
    await Update.getSteamJSON();
    status = 'working';
  }
}

update();

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('DB connected');
});

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.json());

app.use(getUpdateById);
app.use(getGameByID);
app.use(getGameByName)
app.use(postRecc);
app.use(healthcheck);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
