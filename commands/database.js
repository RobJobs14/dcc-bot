const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("Database commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("masters")
        .setDescription("Search the masters database")
        .addStringOption((option) =>
          option
            .setName("type")
            .setRequired(true)
            .addChoices(
              { name: "opening", value: "opening" },
              { name: "game", value: "game" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to search or the starting position")
        )
        .addStringOption((option) =>
          option.setName("pgn").setDescription("The PGN string to search")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("lichess")
        .setDescription("Search the lichess database")
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to search or the starting position")
        )
        .addStringOption((option) =>
          option.setName("pgn").setDescription("The PGN string to search")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("player")
        .setDescription("Search a player's database")
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("The username of the player")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to search or the starting position")
        )
        .addStringOption((option) =>
          option.setName("pgn").setDescription("The PGN string to search")
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "masters") {
      const type = interaction.options.getString("type");
      const fen = interaction.options.getString("fen");
      const pgn = interaction.options.getString("pgn");
      let url = `https://explorer.lichess.ovh/masters`;
      if (fen) url += `?fen=${fen}`;
      if (pgn) url += `${fen ? "&" : "?"}pgn=${pgn}`;
      url += `${fen || pgn ? "&" : "?"}moves=10`;
      const apiResponse = await fetch(url)
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          return {};
        });

      if (type === "opening") {
        const mastersEmbed = new EmbedBuilder()
          .setColor(0xdbc300)
          .setTitle("Masters Database")
          .setDescription(
            `${apiResponse.opening.eco} ${apiResponse.opening.name}`
          );

        apiResponse.moves.forEach((move) => {
          const totalGames = move.white + move.draws + move.black;
          const whiteWinRate = ((move.white / totalGames) * 100).toFixed(1);
          const drawRate = ((move.draws / totalGames) * 100).toFixed(1);
          const blackWinRate = ((move.black / totalGames) * 100).toFixed(1);

          mastersEmbed.addFields({
            name: "\u200B",
            value: `${move.san}: ${totalGames} games ${whiteWinRate}% / ${drawRate}% / ${blackWinRate}%`,
          });
        });

        const totalGames =
          apiResponse.white + apiResponse.draws + apiResponse.black;
        const whiteWinRate = ((apiResponse.white / totalGames) * 100).toFixed(
          1
        );
        const drawRate = ((apiResponse.draws / totalGames) * 100).toFixed(1);
        const blackWinRate = ((apiResponse.black / totalGames) * 100).toFixed(
          1
        );

        mastersEmbed.addFields({
          name: "\u200B",
          value: `Σ: ${totalGames} games ${whiteWinRate}% / ${drawRate}% / ${blackWinRate}%`,
        });
      } else if (type === "game") {
        const mastersEmbed = new EmbedBuilder()
          .setColor(0xdbc300)
          .setTitle("Top Games");

        apiResponse.topGames.forEach((game) => {
          const whitePlayer = `${game.white.name}`;
          const blackPlayer = `${game.black.name}`;
          let result;
          if (game.winner === "white") result = "1-0";
          else if (game.winner === "black") result = "0-1";
          else result = "1/2-1/2";

          mastersEmbed.addFields({
            name: "\u200B",
            value: `${game.uci} [${whitePlayer} - ${blackPlayer}](https://lichess.org/${game.id}) *${game.month}* · ${result}`,
          });
        });
      }

      // Send the embeds
      interaction.reply({ embeds: [mastersEmbed] });
    } else if (subcommand === "lichess") {
      const fen = interaction.options.getString("fen");
      const pgn = interaction.options.getString("pgn");
      let url = `https://explorer.lichess.ovh/lichess`;
      if (fen) url += `?fen=${fen}`;
      if (pgn) url += `${fen ? "&" : "?"}pgn=${pgn}`;
      const apiResponse = await fetch(url)
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          return {};
        });
    } else if (subcommand === "player") {
    }
  },
};
