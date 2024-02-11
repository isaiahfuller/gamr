const express = require('express');
const router = express.Router();
const SteamGames = require('../models/steamGame');

router.post('/steam/recc', (req, res) => {
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

module.exports = router;