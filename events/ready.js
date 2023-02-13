const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity("chess event on Feb 17th 2PM at 2C.11", {
      type: ActivityType.Playing,
    });
  },
};
