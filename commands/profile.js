const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Profile commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set your chess.com or lichess profile")
        .addStringOption((option) =>
          option
            .setName("platform")
            .setDescription("The chess platform")
            .setRequired(true)
            .addChoices(
              { name: "Chess.com", value: "chesscom" },
              { name: "Lichess", value: "lichess" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("Your username")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("share")
        .setDescription("Share your chess.com and lichess profiles")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete your usernames from the server database")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const platform = interaction.options.getString("platform");
      const username = interaction.options.getString("username");
      const { id } = interaction.user;

      try {
        await profileModel.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              [`${platform}Username`]: username,
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.log(err);
        return interaction.reply(
          "There was an error while updating your profile."
        );
      }

      await interaction.reply({
        content: `Your ${
          platform === "chesscom" ? "chess.com" : platform
        } username is now set to "${username}"!`,
        ephemeral: true,
      });
    } else if (subcommand === "share") {
      const { id } = interaction.user;
      const profile = await profileModel.findOne({ userId: id });

      let chesscomData;
      let chesscomUsername;
      let chesscomBulletRating;
      let chesscomBlitzRating;
      let chesscomRapidRating;

      if (profile.chesscomUsername) {
        try {
          const chesscomResponse = await fetch(
            `https://api.chess.com/pub/player/${encodeURI(
              profile.chesscomUsername.toLowerCase()
            )}/stats`
          );
          chesscomData = await chesscomResponse.json();

          chesscomUsername = `[${profile.chesscomUsername}](https://www.chess.com/member/${profile.chesscomUsername})`;
          if (chesscomData.chess_bullet && chesscomData.chess_bullet.last) {
            chesscomBulletRating =
              chesscomData.chess_bullet.last.rating.toString();
          } else {
            chesscomBulletRating = "N/A";
          }
          if (chesscomData.chess_blitz && chesscomData.chess_blitz.last) {
            chesscomBlitzRating =
              chesscomData.chess_blitz.last.rating.toString();
          } else {
            chesscomBlitzRating = "N/A";
          }
          if (chesscomData.chess_rapid && chesscomData.chess_rapid.last) {
            chesscomRapidRating =
              chesscomData.chess_rapid.last.rating.toString();
          } else {
            chesscomRapidRating = "N/A";
          }
        } catch (error) {
          console.error(error);
          chesscomUsername = "Error retrieving data for Chess.com";
          chesscomBulletRating = "N/A";
          chesscomBlitzRating = "N/A";
          chesscomRapidRating = "N/A";
        }
      } else {
        chesscomUsername = "No username registered";
        chesscomBulletRating = "N/A";
        chesscomBlitzRating = "N/A";
        chesscomRapidRating = "N/A";
      }

      let lichessData;
      let lichessUsername;
      let lichessBulletRating;
      let lichessBlitzRating;
      let lichessRapidRating;
      if (profile.lichessUsername) {
        try {
          const lichessResponse = await fetch(
            `https://lichess.org/api/user/${profile.lichessUsername}`
          );
          lichessData = await lichessResponse.json();

          lichessUsername = `[${profile.lichessUsername}](https://lichess.org/@/${profile.lichessUsername})`;
          lichessBulletRating = lichessData.perfs.bullet.rating.toString();
          lichessBlitzRating = lichessData.perfs.blitz.rating.toString();
          lichessRapidRating = lichessData.perfs.rapid.rating.toString();
        } catch (error) {
          console.error(error);
          lichessUsername = "Error retrieving data for Lichess";
          lichessBulletRating = "N/A";
          lichessBlitzRating = "N/A";
          lichessRapidRating = "N/A";
        }
      } else {
        lichessUsername = "No username registered";
        lichessBulletRating = "N/A";
        lichessBlitzRating = "N/A";
        lichessRapidRating = "N/A";
      }

      const whoamiEmbed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s profiles`)
        .setThumbnail(interaction.user.avatarURL())
        .addFields(
          {
            name: "Chess.com",
            value: `${chesscomUsername}\nBullet: ${chesscomBulletRating}\nBlitz: ${chesscomBlitzRating}\nRapid: ${chesscomRapidRating}`,
            inline: true,
          },
          {
            name: "Lichess",
            value: `${lichessUsername}\nBullet: ${lichessBulletRating}\nBlitz: ${lichessBlitzRating}\nRapid: ${lichessRapidRating}`,
            inline: true,
          }
        )
        .setColor(0xdbc300);

      const buttonRow1 = new ActionRowBuilder();
      if (profile.chesscomUsername) {
        buttonRow1.addComponents(
          new ButtonBuilder()
            .setURL(
              `https://www.chess.com/play/online/new?opponent=${profile.chesscomUsername}`
            )
            .setLabel(`Challenge ${interaction.user.username} on Chess.com!`)
            .setStyle(ButtonStyle.Link)
            .setEmoji(`1090274242886635531`)
        );
      } else {
        buttonRow1.addComponents(
          new ButtonBuilder()
            .setCustomId(`chesscomDisabled`)
            .setLabel(`Challenge ${interaction.user.username} on Chess.com!`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`1090274242886635531`)
            .setDisabled(true)
        );
      }

      const buttonRow2 = new ActionRowBuilder();
      if (profile.lichessUsername) {
        buttonRow2.addComponents(
          new ButtonBuilder()
            .setURL(
              `https://lichess.org/?user=${profile.lichessUsername}#friend`
            )
            .setLabel(`Challenge ${interaction.user.username} on Lichess!`)
            .setStyle(ButtonStyle.Link)
            .setEmoji(`1090274244014907422`)
        );
      } else {
        buttonRow2.addComponents(
          new ButtonBuilder()
            .setCustomId(`lichessDisabled`)
            .setLabel(`Challenge ${interaction.user.username} on Lichess!`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`1090274244014907422`)
            .setDisabled(true)
        );
      }

      interaction.reply({
        embeds: [whoamiEmbed],
        components: [buttonRow1, buttonRow2],
      });
    } else if (subcommand === "delete") {
      const { id } = interaction.user;

      try {
        await profileModel.findOneAndDelete({ userId: id });
      } catch (err) {
        console.log(err);
        return interaction.reply(
          "There was an error while clearing your profile."
        );
      }

      await interaction.reply({
        content: "Your profile has been reset!",
        ephemeral: true,
      });
    }
  },
};
