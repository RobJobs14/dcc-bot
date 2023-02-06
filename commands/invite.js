const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the invite link to this server"),
  async execute(interaction) {
    console.log(interaction);
    await interaction.reply({
      content: "https://discord.gg/FQvunv4PAX",
      ephemeral: true,
    });
  },
};
