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
        content: `Hint: White's pawn on c7 might seem dead lost, but it has yet to show his full strength! As per the previous weekly challenge, a great way to defend against threats is to create an even stronger one. Imagine if it was Black's turn to play: he would definitely capture the pawn with ... Rxc7. Are there any interesting ideas that could possibly cause a problem to that specific position? What if Black doesn't capture? If you could make multiple moves, what could reliably defend the c7 pawn?\nTactical Motifs: Fork, Counter-Threat\nFirst piece to move: Pawn`,
        ephemeral: true,
      });
    }
  },
};
