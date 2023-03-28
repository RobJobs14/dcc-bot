const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluation Commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cloud")
        .setDescription("Get the cached evaluation of a position, if available")
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to evaluate")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("tablebase")
        .setDescription(
          "Get the tablebase evaluation of a position with 7 pieces or less"
        )
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to evaluate")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "cloud") {
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
            return interaction.reply({
              content: `Sorry, cloud analysis is not available for this position. You may visit [chess.com](https://www.chess.com/analysis?fen=${encodeURI(
                fen
              )}) or [lichess](https://lichess.org/analysis?fen=${encodeURI(
                fen
              )}) instead for local evaluation.`,
              ephemeral: true,
            });
          }

          const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
            fen
          )}`;

          const uciMoves = apiResponse.pvs.map((pv) => pv.moves);
          const pgnMoves = await convertUCIToPGN(fen, uciMoves);

          const lines = apiResponse.pvs.map((pv) => {
            if (pv.mate) {
              return `**#${pv.mate}**: ${
                pgnMoves[apiResponse.pvs.indexOf(pv)]
              }`;
            } else {
              const evalInCentipawns = pv.cp;
              const evaluation = (evalInCentipawns / 100).toFixed(2);
              return `**${evaluation > 0 ? "+" : ""}${evaluation}**: ${
                pgnMoves[apiResponse.pvs.indexOf(pv)]
              }`;
            }
          });

          const evalEmbed = new EmbedBuilder()
            .setColor("0xdbc300")
            .setTitle(`Cloud Evaluation Depth: ${apiResponse.depth}`)
            .setDescription(lines.join("\n"))
            .setImage(imageURL);

          const analyze = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setURL(
                `https://www.chess.com/analysis?fen=${encodeURIComponent(fen)}`
              )
              .setLabel(`Analyze on Chess.com`)
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setURL(
                `https://lichess.org/analysis?fen=${encodeURIComponent(fen)}`
              )
              .setLabel(`Analyze on Lichess`)
              .setStyle(ButtonStyle.Link)
          );

          interaction.reply({ embeds: [evalEmbed], components: [analyze] });
        })();
      });
    } else if (subcommand === "tablebase") {
      const fen = interaction.options.getString("fen");
      const apiResponse = await fetch(
        `https://tablebase.lichess.ovh/standard?fen=${fen}`
      )
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          return {};
        });

      if (!apiResponse.moves) {
        return interaction.reply({
          content: `Sorry, tablebase information is not available for this position.`,
          ephemeral: true,
        });
      }
      const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
        fen
      )}`;
      const tablebaseEmbed = new EmbedBuilder()
        .setColor("0xdbc300")
        .setTitle("7-piece Syzygy Tablebase")
        .setImage(imageURL);

      if (apiResponse.checkmate === true) {
        tablebaseEmbed.addFields({
          name: "Game Over",
          value: "Checkmate",
          inline: true,
        });
      }

      if (apiResponse.stalemate === true) {
        tablebaseEmbed.addFields({
          name: "Game Over",
          value: "Stalemate",
          inline: true,
        });
      }

      if (apiResponse.insufficient_material === true) {
        tablebaseEmbed.addFields({
          name: "Game Over",
          value: "Insufficient Material",
          inline: true,
        });
      }

      if (apiResponse.moves) {
        let losingMoves = "";
        let drawnMoves = "";
        let winningMoves = "";

        apiResponse.moves.forEach((move) => {
          let status;
          if (move.checkmate === true) {
            status = "Checkmate";
          } else if (move.stalemate === true) {
            status = "Stalemate";
          } else if (move.insufficient_material === true) {
            status = "Insufficient Material";
          } else {
            if (move.dtz === 0) {
              status = "Draw";
            } else if (move.san[0].toLowerCase() === move.san[0]) {
              if (move.dtm !== null) {
                status = `Pawn move DTM ${Math.abs(move.dtm)}`;
              } else {
                status = `Pawn move`;
              }
            } else if (move.san.includes("x")) {
              if (move.dtm !== null) {
                status = `Capture DTM ${Math.abs(move.dtm)}`;
              } else {
                status = `Capture`;
              }
            } else if (move.dtm !== null) {
              status = `DTZ ${Math.abs(move.dtz)} DTM ${Math.abs(move.dtm)}`;
            } else {
              status = `DTZ ${Math.abs(move.dtz)}`;
            }
          }

          if (move.category === "win") {
            losingMoves += `${move.san}: ${status}\n`;
          } else if (move.category === "draw") {
            drawnMoves += `${move.san}: ${status}\n`;
          } else {
            winningMoves += `${move.san}: ${status}\n`;
          }
        });

        if (winningMoves) {
          tablebaseEmbed.addFields({
            name: "Winning",
            value: winningMoves,
          });
        }

        if (drawnMoves) {
          tablebaseEmbed.addFields({ name: "Drawn", value: drawnMoves });
        }

        if (losingMoves) {
          tablebaseEmbed.addFields({ name: "Losing", value: losingMoves });
        }
      }

      interaction.reply({ embeds: [tablebaseEmbed] });
    }
  },
};
