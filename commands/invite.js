const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the invite link to this server"),
  async execute(interaction) {
    console.log(interaction);
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply({
      content: "https://discord.gg/FQvunv4PAX",
      ephemeral: true,
    });
  },
};
