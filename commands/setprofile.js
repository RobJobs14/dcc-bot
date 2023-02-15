const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setprofile")
    .setDescription("Set your chess.com or lichess profile")
    .addStringOption((option) =>
      option
        .setName("platform")
        .setDescription("The chess platform")
        .setRequired(true)
        .addChoices(
          { name: "Chess.com", value: "chesscom" },
          { name: "Lichess", value: "lichess" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Your username")
        .setRequired(true)
    ),

  async execute(interaction) {
    const platform = interaction.options.getString("platform");
    const username = interaction.options.getString("username");
    const { id } = interaction.user;

    try {
      await profileModel.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            [`${platform}Username`]: username,
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.log(err);
      return interaction.reply(
        "There was an error while updating your profile."
      );
    }

    await interaction.reply({
      content: `Your ${
        platform === "chesscom" ? "chess.com" : platform
      } username is now set to "${username}"!`,
      ephemeral: true,
    });
  },
};
