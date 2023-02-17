const { SlashCommandBuilder } = require("discord.js");

const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Challenge commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setDescription("Give an answer to the weekly chess challenge")
        .addStringOption((option) =>
          option
            .setName("answer")
            .setDescription("Your answer")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("hint")
        .setDescription("Get a hint for the current weekly chess challenge")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update")
        .setDescription("Update the hint for the weekly challenge")
        .addStringOption((option) =>
          option
            .setName("answer")
            .setDescription("Your answer")
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "answer") {
      const author = interaction.user.username;
      const answer = interaction.options.getString("answer");

      const dedicatedChannel = interaction.guild.channels.cache.find(
        (channel) => channel.name === "challenge-answers"
      );
      if (!dedicatedChannel)
        return interaction.reply("Answers channel not found.");

      const previousMessage = await dedicatedChannel.messages
        .fetch({ limit: 1, author: interaction.user })
        .then((messages) => messages.first());
      if (previousMessage) await previousMessage.delete();

      await dedicatedChannel.send(`${author}: ${answer}`);
      await interaction.reply({ content: "Answer Saved!", ephemeral: true });
    } else if (subcommand === "hint") {
      // If there is no current hint set, reply with a message saying so.
      if (!currentHint) {
        await interaction.reply({
          content: "There is currently no hint available.",
          ephemeral: true,
        });
      } else {
        // Otherwise, reply with the current hint.
        await interaction.reply({
          content: `${currentHint}`,
          ephemeral: true,
        });
      }
    } else if (subcommand === "update") {
      // Get the new hint from the options.
      const newHint = interaction.options.getString("hint");

      // Update the current hint to the new hint.
      currentHint = newHint;

      // Save the new hint to the environment variable.
      process.env.CURRENT_HINT = newHint;

      // Reply to the user to confirm the hint has been updated.
      await interaction.reply({ content: "Hint updated.", ephemeral: true });
    }
  },
};
