const fs = require('fs-extra');
const fetch = require('node-fetch');
const delay = require('delay');
const _ = require('lodash');

async function getSteamJSON() {
  fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json')
    .then(res => res.json())
    .then(async data => {
      console.log("Update started")
      var games = data.applist.apps;
      var totalGames = 0;
      var dir = `${__dirname}/json`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0o744);
      }
      for (let i = 0; i < Math.ceil(games.length / 10000); i++) {
        let current = [];
        for (let j = 0; j < 10000 && totalGames < games.length; j++) {
          current.push(games[totalGames]);
          totalGames++;
        }
        fs.writeFileSync(`${dir}/${i}.json`, JSON.stringify({ current }));
      }
      await main(dir);
      console.log("Update complete")
    });
}

async function main(dir) {
  for (let i = 0; i < fs.readdirSync(dir).length; i++) {
    // console.log(`Starting main loop ${i}`);
    let fileDir = `${dir}/${i}.json`;
    let fileRaw = fs.readFileSync(fileDir);
    let gameData = JSON.parse(fileRaw);
    let games = gameData.current;
    await send(games);
  }
}

async function send(games) {
  var found = 0;
  for (let i = 0; i < games.length - 1; i++) {
    if (!found > 0) await delay(1.6e3);
    await fetch(`http://localhost:3001/steam/updatebyid/${games[i].appid}`)
      .then(res => res.json())
      .then(data => {
        if (data.found) {
          found++;
        } else found = 0;
      })
      .catch(err => {
        console.error(err);
        console.log(`Error at id ${games[i].appid}`);
        i--;
      });
  }
}

module.exports = { getSteamJSON };
