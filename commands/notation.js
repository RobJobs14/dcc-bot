const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("notation")
    .setDescription("Get a list of chess notations"),
  async execute(interaction) {
    const notationEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("List of Chess Notations")
      .addFields(
        { name: "!", value: "Good move", inline: true },
        { name: "!!", value: "Brilliant move", inline: true },
        { name: "!?", value: "Interesting move", inline: true },
        { name: "?", value: "Mistake", inline: true },
        { name: "??", value: "Blunder", inline: true },
        { name: "?!", value: "Dubious move", inline: true },
        { name: "N", value: "Novelty", inline: true },
        { name: "\u25A1", value: "Only move", inline: true },
        { name: "\u25B3", value: "With the idea", inline: true },
        { name: "=", value: "Equal position", inline: true },
        { name: "\u221E", value: "Unclear position", inline: true },
        { name: "=\u221E", value: "With compensation", inline: true },
        { name: "\u2A72", value: "White is slightly better", inline: true },
        { name: "\u00B1", value: "White is better", inline: true },
        { name: "+-", value: "White is winning", inline: true },
        { name: "\u2A71", value: "Black is slightly better", inline: true },
        { name: "\u2213", value: "Black is better", inline: true },
        { name: "-+", value: "Black is winning", inline: true },
        { name: "\u21C8", value: "Development", inline: true },
        { name: "\u2191", value: "Initiative", inline: true },
        { name: "\u2192", value: "Attack", inline: true },
        { name: "\u21C6", value: "Counterplay", inline: true },
        { name: "\u2299", value: "Zugzwang", inline: true },
        { name: "\u2295", value: "Time Trouble", inline: true }
      );
    await interaction.reply({ ephemeral: true, embeds: [notationEmbed] });
  },
};
