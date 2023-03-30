const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View FEN")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const messageContent = interaction.targetId;
    interaction.reply(messageContent);
  },
};
