const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View FEN")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    console.log(interaction.targetMessage);
    console.log(interaction.targetMessage.content);
  },
};
