const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View FEN")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { imaLink } = interaction.targetMessage.attachments.first();
    interaction.reply(imaLink);
  },
};
