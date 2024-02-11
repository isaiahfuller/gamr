require('dotenv').config();
const _ = require('lodash');
const express = require('express');
const Steam = require('./steamspy');
const PORT = process.env.PORT || 3001;
const MONGODB_URL = process.env.MONGO || 'mongodb://localhost:27017/gamr';
const mongoose = require('mongoose');
const Update = require('./import');
const SteamGames = require('./models/steamGame');

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

app.get('/steam/updatebyid/:id', (req, res) => {
  var params = req.params.id.split('&');
  var force = false;
  if (params[1] === 'force') force = true;
  var now = new Date();
  var id = params[0];
  SteamGames.findOne({ appid: id }, (err, searchedGame) => {
    if (err) return console.error(err);
    if (
      !searchedGame ||
      now.getDate() - 7 > new Date(searchedGame.last_updated).getDate() ||
      !searchedGame.last_updated ||
      searchedGame.invalid ||
      force
    ) {
      Steam.getGameByID(id)
        .then(game => {
          if (game) {
            if (searchedGame) {
              var result = Object.assign(game, {
                invalid: false,
                last_updated: now,
              });
              SteamGames.findOneAndUpdate({ appid: id }, result)
                .then(updated => {
                  // console.log("Updated", id);
                  res.json(game);
                  return game;
                })
                .catch(console.error);
            } else {
              var result = new SteamGames(
                Object.assign(game, {
                  invalid: false,
                  last_updated: now,
                })
              );
              result.save(err => {
                if (err) {
                  res.set('Connection', 'close');
                  return console.error(err);
                }
                res.json({ update: 'success' });
                return game;
              });
            }
          }
        })
        .catch(console.error);
    } else {
      // console.log(`Found game with id ${id}`);
      res.set('Connection', 'close');
      let found = Object.assign({ found: true }, searchedGame);
      res.json(found);
      return searchedGame;
    }
  });
});

app.get('/steam/appid/:id', (req, res) => {
  var now = new Date();
  var id = req.params.id;
  SteamGames.findOne({ appid: id }, (err, searchedGame) => {
    if (err) return console.error(err);
    if (!searchedGame) {
      res.status(404);
    }
    console.log(`Found game with id ${id}`);
    res.set('Connection', 'close');
    let found = Object.assign({ found: true }, searchedGame);
    res.json(found);
    return searchedGame;
  });
});

app.get('/steam/name/:name', (req, res) => {
  try {
    SteamGames.find({
      name: new RegExp(`${req.params.name}+`, 'i'),
      'steam.type': 'game',
    })
      .limit(100)
      .exec((err, games) => {
        if (err) return console.error(err);
        res.json(relevanceSort(games, req.params.name));
        return res;
      });
  } catch (error) {
    console.error(error);
  }
});

app.post('/steam/recc', (req, res) => {
  const { developer, publisher, tags, appid } = req.body;
  let queryBase = {
    'steam.type': 'game',
    appid: { $not: { $eq: appid } },
  };
  if (developer.length > 0)
    queryBase = Object.assign(queryBase, {
      'steam.developers': { $in: developer },
    });
  if (publisher.length > 0)
    queryBase = Object.assign(queryBase, {
      'steam.publishers': { $in: publisher },
    });
  tags.forEach(tag => {
    queryBase = Object.assign(queryBase, {
      [`tags.${tag}`]: { $exists: true },
    });
  });
  try {
    SteamGames.find(queryBase)
      .sort({ [`tags.${tags[0]}`]: -1 })
      .limit(100)
      .exec((err, games) => {
        if (err) console.error(err);
        res.send(games).status(200);
      });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
