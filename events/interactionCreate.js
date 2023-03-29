const { Events } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    let profileData;
    let targetProfileData;

    if (interaction.isChatInputCommand()) {
      try {
        profileData = await profileModel.findOne({
          userId: interaction.user.Id,
        });
        if (!profileData) {
          profileData = await profileModel.create({
            userId: interaction.user.id,
            serverId: interaction.guild.id,
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else if (interaction.isUserContextMenuCommand()) {
      try {
        targetProfileData = await profileModel.findOne({
          userId: interaction.targetId,
        });
        if (!targetProfileData) {
          targetProfileData = await profileModel.create({
            userId: interaction.targetId,
            serverId: interaction.guild.id,
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      if (interaction.isChatInputCommand()) {
        await command.execute(interaction, profileData);
      } else if (interaction.isUserContextMenuCommand()) {
        await command.execute(interaction, targetProfileData);
      } else if (interaction.isMessageContextMenuCommand()) {
        await command.execute(interaction);
      }
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  },
};
