require('dotenv').config();
const _ = require('lodash');
const Update = require('./import');
const mongoose = require('mongoose');
const express = require('express');
const SteamGames = require('./models/steamGame');
const getUpdateById = require('./routes/getUpdateById');
const getGameByID = require('./routes/getGameById');
const getGameByName = require('./routes/getGameByName');
const postRecc = require('./routes/postRecc');

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

function relevanceSort(array, searchTerm) {
  searchTerm = searchTerm.trim();
  let scoreArray = _.filter(array, o => {
    return o.positive + o.negative > 0;
  });

  let scoreSortedArray = scoreArray.sort((first, second) => {
    firstScore = first.positive / (first.positive + first.negative);
    secondScore = second.positive / (second.positive + second.negative);
    if (firstScore > secondScore) return -1;
    else if (secondScore > firstScore) return 1;
    else if (firstScore === secondScore) return 0;
  });

  let startsWithArray = _.filter(scoreSortedArray, o => {
    return o.name
      .trim()
      .toLowerCase()
      .startsWith(searchTerm.toLowerCase() + ' ');
  });

  let nameSortedArray = _.filter(scoreSortedArray, o => {
    return o.name.trim().toLowerCase().startsWith(searchTerm.toLowerCase());
  });

  let finalArray = _.uniq(
    _.concat(
      startsWithArray,
      nameSortedArray,
      scoreSortedArray,
      scoreArray,
      array
    )
  );

  return finalArray;
}

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

app.get('/api/status', (req, res) => {
  res.json({ message: status });
});

app.use(getUpdateById);
app.use(getGameByID);
app.use(getGameByName)
app.use(postRecc);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
