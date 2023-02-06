const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Get the cached evaluation of a position, if available")
    .addStringOption((option) =>
      option
        .setName("fen")
        .setDescription("The FEN string to evaluate")
        .setRequired(true)
    ),
  async execute(interaction) {
    import("../convert-uci-to-pgn.mjs").then(({ convertUCIToPGN }) => {
      (async function () {
        const fen = interaction.options.getString("fen");
        const apiResponse = await fetch(
          `https://lichess.org/api/cloud-eval?multiPv=3&fen=${fen}`
        )
          .then((res) => res.json())
          .catch((err) => {
            console.error(err);
            return {};
          });

        if (!apiResponse.pvs || !apiResponse.pvs.length) {
          return interaction.reply(
            `Sorry, cloud analysis is not available for this position. You may visit [lichess](https://lichess.org/analysis?fen=${encodeURI(
              fen
            )}) instead for local evaluation.`
          );
        }

        const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
          fen
        )}`;

        const uciMoves = apiResponse.pvs.map((pv) => pv.moves);
        const pgnMoves = await convertUCIToPGN(fen, uciMoves);

        const lines = apiResponse.pvs.map((pv) => {
          const evalInCentipawns = pv.cp;
          const evaluation = (evalInCentipawns / 100).toFixed(2);
          return `**${evaluation > 0 ? "+" : ""}${evaluation}**: ${
            pgnMoves[apiResponse.pvs.indexOf(pv)]
          }`;
        });

        const evalEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Cloud Evaluation Depth: ${apiResponse.depth}`)
          .setDescription(lines.join("\n"))
          .setImage(imageURL);

        interaction.reply({ embeds: [evalEmbed] });
      })();
    });
  },
};
