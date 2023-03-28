const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fen")
    .setDescription("Display a FEN position")
    .addStringOption((option) =>
      option
        .setName("fen")
        .setDescription("The FEN string to display")
        .setRequired(true)
    ),
  async execute(interaction) {
    const fen = interaction.options.getString("fen");
    const analyze = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(`https://www.chess.com/analysis?fen=${encodeURI(fen)}`)
        .setLabel(`Analyze on Chess.com`)
        .setStyle(ButtonStyle.Link)
        .setEmoji(`1090274242886635531`),
      new ButtonBuilder()
        .setURL(`https://lichess.org/analysis?fen=${encodeURI(fen)}`)
        .setLabel(`Analyze on Lichess`)
        .setStyle(ButtonStyle.Link)
        .setEmoji(`1090279571846340619`)
    );
    const chesssable = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(`https://www.chessable.com/courses/?fen=${encodeURI(fen)}`)
        .setLabel(`Search on Chessable`)
        .setStyle(ButtonStyle.Link)
        .setEmoji(`1090274244014907422`)
    );
    await interaction.reply({
      content: `http://lichess1.org/export/fen.gif?fen=${encodeURI(fen)}`,
      components: [analyze, chesssable],
    });
  },
};
