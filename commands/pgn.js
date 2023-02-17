const { SlashCommandBuilder } = require("discord.js");

const { LICHESS_TOKEN: litoken } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pgn")
    .setDescription("Pgn commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("gif")
        .setDescription("Get the GIF of a PGN")
        .addStringOption((option) =>
          option
            .setName("pgn")
            .setDescription("The moves to view")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("fen").setDescription("The starting position")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Display the PGN on an board (coming soon)")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "gif") {
      const pgn = interaction.options.getString("pgn");
      const fen = interaction.options.getString("fen");

      // Create variables to hold the header and PGN text
      let headerTags = "";
      let pgnText = pgn;

      // Check if the user provided a FEN, and add it to the header tags if so
      if (fen) {
        headerTags += `[FEN "${fen}"]\n`;
      }

      // Check if the user provided any header tags in the PGN, and add them if not
      if (!pgn.includes("[White") && !pgn.includes("[Black")) {
        headerTags += `[White "White"]\n[Black "Black"]\n`;
      }

      // Combine the header tags and PGN text into the final PGN string
      pgnText = headerTags + pgnText;

      const params = new URLSearchParams();
      params.append("pgn", `${pgnText}`);
      const response = await fetch("https://lichess.org/api/import", {
        method: "POST",
        body: params,
        headers: {
          Authorization: `Bearer ${litoken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => response.json())
        .then((pgn) => {
          const id = pgn.id;

          interaction.reply(
            `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`
          );
        });
    } else if (subcommand === "view") {
      await interaction.reply({
        content: "Coming soon!",
        ephemeral: true,
      });
    }
  },
};
