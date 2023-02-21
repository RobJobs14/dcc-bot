import { Chess } from "chess.js";

export async function updateFen(pgn, fen) {
  let chess = new Chess(fen);

  const moves = pgn
    .split(/\d+\./)
    .filter((move) => move.trim().length > 0)
    .map((move) => move.trim())
    .flatMap((move) => move.split(/\s+/))
    .map((move) => move.replace(/^\d+\./, ""));

  const updatedFens = [{ fen: chess.fen(), turn: chess.turn() }];
  for (let i = 0; i < moves.length; i++) {
    let move = chess.move(moves[i], { sloppy: true });

    if (move) {
      updatedFens.push({ fen: chess.fen(), turn: chess.turn() });
    }
  }

  return updatedFens;
}
