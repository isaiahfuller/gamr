const express = require('express');
const router = express.Router();
const SteamGames = require('./models/steamGame');

router.get('/steam/name/:name', (req, res) => {
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

module.exports = router;