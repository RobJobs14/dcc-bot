const { Events } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isUserContextMenuCommand()
    )
      return;

    //get user db information and pass to command
    let profileData;
    let targetProfileData;
    try {
      profileData = await profileModel.findOne({ userId: interaction.user.Id });
      if (!profileData) {
        profileData = await profileModel.create({
          userId: interaction.user.id,
          serverId: interaction.guild.id,
        });
      }
      targetProfileData = await profileModel.findOne({
        userId: interaction.targetId
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

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction, profileData);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  },
};
