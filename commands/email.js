const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("email")
    .setDescription("Get the dawson chess club email"),
  async execute(interaction) {
    console.log(interaction);
    await interaction.reply({
      content: "chessandgoclub@dawsonstudentunion.com",
      ephemeral: true,
    });
  },
};
