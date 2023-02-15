import { Chess } from "chess.js";

export async function getStats(pgn) {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const fen = chess.fen();

  const apiUrl1 = `https://explorer.lichess.ovh/masters?fen=${fen}`;
  const apiUrl2 = `https://explorer.lichess.ovh/lichess?fen=${fen}`;

  const fetchData = async (apiUrl) => {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      const { white, draws, black } = data;
      return { white, draws, black };
    } catch (err) {}
  };

  const data1 = await fetchData(apiUrl1);
  const data2 = await fetchData(apiUrl2);

  const total1 = data1.white + data1.draws + data1.black;
  const total2 = data2.white + data2.draws + data2.black;

  const data1WhitePercentage = (data1.white / total1) * 100 || 0;
  const data1DrawsPercentage = (data1.draws / total1) * 100 || 0;
  const data1BlackPercentage = (data1.black / total1) * 100 || 0;

  const data2WhitePercentage = (data2.white / total2) * 100 || 0;
  const data2DrawsPercentage = (data2.draws / total2) * 100 || 0;
  const data2BlackPercentage = (data2.black / total2) * 100 || 0;

  const data1String = `${total1} Masters games: ${data1WhitePercentage.toFixed(
    2
  )}% / ${data1DrawsPercentage.toFixed(2)}% / ${data1BlackPercentage.toFixed(
    2
  )}%`;
  const data2String = `${total2} Lichess games: ${data2WhitePercentage.toFixed(
    2
  )}% / ${data2DrawsPercentage.toFixed(2)}% / ${data2BlackPercentage.toFixed(
    2
  )}%`;

  return [data1String, data2String];
}
