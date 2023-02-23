const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Challenge commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("answer")
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

      await dedicatedChannel.send(`${author}: ${answer}`);
      await interaction.reply({ content: "Answer Saved!", ephemeral: true });
    } else if (subcommand === "hint") {
      await interaction.reply({
        content: `Hint: What if it was White to move? What piece are they going to play?\n\nTactical Motifs: Zugzwang\n\nFirst piece to move: Rook`,
        ephemeral: true,
      });
    }
  },
};
