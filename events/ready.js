const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity(
      "discord break my code so some commands will not work",
      {
        type: ActivityType.Watching,
      }
    );
  },
};
