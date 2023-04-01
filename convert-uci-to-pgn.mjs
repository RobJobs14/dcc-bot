import { Chess } from "chess.js";

export async function convertUCIToPGN(fen, uciMoves) {
  // Check if uciMoves is a single UCI move string or an array of UCI move strings
  let singleMove = false;
  if (!Array.isArray(uciMoves)) {
    singleMove = true;
    uciMoves = [uciMoves];
  }

  const pgnMoves = [];

  for (let i = 0; i < uciMoves.length; i++) {
    const chess = new Chess(fen);
    let uciMoveArray;
    if (singleMove) {
      // Split the UCI move string into individual moves using a regular expression
      uciMoveArray = uciMoves[i].match(/.{1,4}/g);
    } else {
      // Split the UCI move string on spaces
      uciMoveArray = uciMoves[i].split(" ");
    }
    for (let j = 0; j < uciMoveArray.length; j++) {
      const move = uciMoveArray[j];
      if (move === "e1h1") {
        chess.move("e1g1");
      } else if (move === "e1a1") {
        chess.move("e1c1");
      } else if (move === "e8h8") {
        chess.move("e8g8");
      } else if (move === "e8a8") {
        chess.move("e8c8");
      } else {
        chess.move(move);
      }
    }
    const history = chess.history();
    let pgnMove = "";
    if (
      fen === "startpos" ||
      fen === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    ) {
      for (let i = 0; i < history.length; i++) {
        if (i % 2 === 0) {
          pgnMove += `${Math.floor(i / 2) + 1}. `;
        }
        pgnMove += `${history[i]} `;
      }
    } else {
      pgnMove = chess.pgn({ newline_char: "\n" }).split("\n").slice(2).join("");
    }
    pgnMove = pgnMove.replace(/(\.\s)\.\.\.\s/g, "... ");
    pgnMoves.push(pgnMove.trim());
  }

  return pgnMoves;
}