const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fen")
    .setDescription("Display a FEN position")
    .addStringOption((option) =>
      option
        .setName("fen")
        .setDescription("The FEN string to display")
        .setRequired(true)
    ),
  async execute(interaction) {
    const fen = interaction.options.getString("fen");
    await interaction.reply(
      `http://lichess1.org/export/fen.gif?fen=${encodeURI(fen)}`
    );
  },
};
