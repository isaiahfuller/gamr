const fetch = require("node-fetch");
const baseURL = "https://steamspy.com/api.php";

function getGameByID(id) {
  var url = baseURL.concat(`?request=appdetails&appid=${id}`);
  return fetch(url)
    .then((response) => response.text())
    .then((data) => {
      var gameData = JSON.parse(data);
      if (gameData.name) {
        var media = getGameMedia(id).then((res) => {
          if (!res || res.background === "access denied")
            return { invalid: true };
          else {
            var tempData = data.replace(/\./g, "．");
            tempData = tempData.replace(/\$/g, "＄");
            var game = Object.assign(JSON.parse(tempData), { steam: res.data });
            return game;
          }
        });
        return media;
      } else {
        console.log(`SteamSpy: Invalid ID ${id}`);
        return { invalid: true };
      }
    })
    .catch((err) => {
      console.error(err);
      return { name: null };
    });
}

/**
 * Takes the name of a tag. Maybe en only? Could be an issue.
 * The numbers are upvotes, not IDs.
 * @param {String} tag
 * @returns
 */
function searchByTag(tag) {
  var url = baseURL.concat(`?request=tag&tag=${tag}`);
  return fetch(url)
    .then((res) => res.text())
    .then((data) => {
      console.log(JSON.parse(data));
    });
}

function getGameMedia(id) {
  var url = `https://store.steampowered.com/api/appdetails?appids=${id}`;
  return fetch(url)
    .then((res) => res.text())
    .then((data) => {
      if (!data.includes("Access Denied")) {
        var game = JSON.parse(data);
        if (game) {
          game = game[id];
          if (game.success) {
            console.log(`Getting info from Steam: ${id}`);
            return game;
          } else {
            console.log(`Invalid appid: ${id}`);
            return {
              background: "access denied",
              invalid: true,
            };
          }
        }
      } else {
        console.log("Steam: Access denied");
        return {
          background: "access denied",
        };
      }
    })
    .catch((err) => {
      console.error(err);
      return {
        background: "access denied",
      };
    });
}

// getGameByID(319910).then(console.log);
// getGameByID(3).then(console.log);
// searchByTag('Looter Shooter');

module.exports = {
  getGameByID,
  searchByTag,
  getGameMedia,
};
