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
      await interaction.deferReply();
      const channel = interaction.channel;
      const messages = await channel.messages.fetch({ limit: 100 });
      const lastImage = messages.find((message) => {
        if (message.attachments.size > 0) {
          return true;
        }
        const linkRegex = /https?:\/\/.*\.(?:png|jpg|gif)/;
        return linkRegex.test(message.content);
      });
      if (lastImage) {
        let url;
        if (lastImage.attachments.size > 0) {
          url = lastImage.attachments.first().url;
        } else {
          url = lastImage.content;
        }
        const form = new FormData();
        form.append("url", url);
        const wait = require("node:timers/promises").setTimeout;
        const response = await Promise.race([
          fetch("http://robjobs.pythonanywhere.com/analyze", {
            method: "POST",
            body: form,
          }),
          wait(15000),
        ]);
        if (response) {
          const data = await response.text();
          await interaction.editReply(data);
        } else {
          await interaction.editReply("No response within 15 seconds");
        }
      } else {
        await interaction.editReply("No image found");
      }
    }
  },
};
