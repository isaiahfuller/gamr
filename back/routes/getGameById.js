const express = require('express');
const router = express.Router();
const SteamGames = require('./models/steamGame');

router.get('/steam/appid/:id', (req, res) => {
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

module.exports = router;