const express = require('express');
const router = express.Router();
const Steam = require('../steamspy');
const SteamGames = require('../models/steamGame');

// This technically should be a PUT request
// todo: change to PUT @isaiahfuller @dragonfleas
router.get('/steam/updatebyid/:id', (req, res) => {
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

module.exports = router;