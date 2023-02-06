const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("answer")
    .setDescription("Give an answer to the weekly chess challenge")
    .addStringOption((option) =>
      option.setName("answer").setDescription("Your answer").setRequired(true)
    ),

  async execute(interaction) {
    const author = interaction.user.username;
    const answer = interaction.options.getString("answer");

    const dedicatedChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === "challenge-answers"
    );
    if (!dedicatedChannel)
      return interaction.reply("Dedicated channel not found.");

    const previousMessage = await dedicatedChannel.messages
      .fetch({ limit: 1, author: interaction.user })
      .then((messages) => messages.first());
    if (previousMessage) await previousMessage.delete();

    await dedicatedChannel.send(`${author}: ${answer}`);
    await interaction.reply({ content: "Answer Saved!", ephemeral: true });
  },
};
