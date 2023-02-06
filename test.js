const ChessWebAPI = require(`chess-web-api`);

const chessAPI = new ChessWebAPI();

chessAPI
  .getGameByID(68872385397)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
