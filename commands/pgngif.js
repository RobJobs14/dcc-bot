const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { LICHESS_TOKEN: litoken } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pgn gif")
    .setDescription("Get the GIF of a PGN")
    .addStringOption((option) =>
      option
        .setName("pgn")
        .setDescription("The moves to view")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("fen").setDescription("The starting position")
    ),
  async execute(interaction) {
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
        const imageURL = `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`;
        const pgnEmbed = new EmbedBuilder()
          .setColor("0xdbc300")
          .setImage(imageURL);
        interaction.reply({ embeds: [pgnEmbed] });
      });
  },
};
