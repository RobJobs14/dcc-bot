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
    .setName("shareprofile")
    .setDescription("Share your chess.com and lichess profiles"),

  async execute(interaction) {
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
          chesscomBlitzRating = chesscomData.chess_blitz.last.rating.toString();
        } else {
          chesscomBlitzRating = "N/A";
        }
        if (chesscomData.chess_rapid && chesscomData.chess_rapid.last) {
          chesscomRapidRating = chesscomData.chess_rapid.last.rating.toString();
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
      .setColor("0xdbc300");

    const buttonRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(
          `https://www.chess.com/play/online/new?opponent=${profile.chesscomUsername}`
        )
        .setLabel(`Challenge ${interaction.user.username} on Chess.com!`)
        .setStyle(ButtonStyle.Link)
    );

    const buttonRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(`https://lichess.org/?user=${profile.lichessUsername}#friend`)
        .setLabel(`Challenge ${interaction.user.username} on Lichess!`)
        .setStyle(ButtonStyle.Link)
    );

    interaction.reply({
      embeds: [whoamiEmbed],
      components: [buttonRow1, buttonRow2],
    });
  },
};
