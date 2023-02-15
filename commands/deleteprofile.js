const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteprofile")
    .setDescription("Delete your usernames from the server database"),

  async execute(interaction) {
    const { id } = interaction.user;

    try {
      await profileModel.findOneAndDelete({ userId: id });
    } catch (err) {
      return interaction.reply(
        "There was an error while clearing your profile."
      );
    }

    await interaction.reply({
      content: "Your profile has been reset!",
      ephemeral: true,
    });
  },
};
