const { Events } = require("discord.js");
const ChessWebAPI = require("chess-web-api");

const { LICHESS_TOKEN: token } = process.env;

module.exports = {
  name: Events.MessageCreate,
  once: false,
  execute(message) {
    if (message.content.includes("https://www.chess.com/game/live/")) {
      const id = message.content.split("/").pop();
      const chessAPI = new ChessWebAPI();
      chessAPI.getGameByID(id).then((res) => {
        let gameID = new URLSearchParams();
        gameID.append(`pgn`, res.body.game.pgn);
        fetch("https://lichess.org/api/import", {
          method: "POST",
          body: gameID,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
          .then((response) => response.json())
          .then((gameID) => {
            const id = gameID.id;
            message.channel.send(
              `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`
            );
          })
          .catch((error) => console.error(error));
      });
    } else if (message.content.includes("https://lichess.org/")) {
      const startIndex = message.content.indexOf("https://lichess.org/") + 20;
      const id = message.content.substring(startIndex, startIndex + 8);
      message.channel.send(
        `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`
      );
    }
  },
};
