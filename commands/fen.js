const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fen")
    .setDescription("FEN Commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Display a FEN")
        .addStringOption((option) =>
          option
            .setName("fen")
            .setDescription("The FEN string to display")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get")
        .setDescription("Predict the FEN of a 2D chessboard")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "view") {
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
    } else if (subcommand === "get") {
      const channel = interaction.channel;
      const messages = await channel.messages.fetch({ limit: 100 });
      const lastAttachment = messages.find(
        (message) => message.attachments.size > 0
      );
      if (lastAttachment) {
        console.log(lastAttachment.attachments.first().url);
      } else {
        console.log("No message with attachment found");
      }
    }
  },
};
