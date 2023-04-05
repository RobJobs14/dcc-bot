const { decode } = require("html-entities");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { formatError, formatPages } = require("../lib/format-pages");

function video(author, query, interaction) {
  const url = `https://lichess.org/video?q=${encodeURI(query)}`;
  let status, statusText;
  return fetch(url, { params: { q: query } })
    .then((response) => {
      status = response.status;
      statusText = response.statusText;
      return response.text();
    })
    .then((query) => setVideos(query, interaction))
    .then((embeds) =>
      formatPages("Video", embeds, interaction, "No videos found.")
    )
    .catch((error) => {
      console.log(`Error in video(${author.username}, ${query}): ${error}`);
      return formatError(
        status,
        statusText,
        interaction,
        `${url} failed to respond`
      );
    });
}

function setVideos(document, interaction) {
  return getVideos(document).map((video) => formatVideo(...video));
}

function getVideos(document) {
  const videos = [];
  const pattern =
    /<a class="[ \w]+" href="\/video\/([-\w]+)?\??(?:q=[ \w]+)?"><span class="duration">(.+?)<\/span>.+?<span class="full-title">(.+?)<\/span><span class="author">(.+?)<\/span><span class="target">(.+?)<\/span><span class="tags">(.+?)<\/span>/g;
  for (match of document.matchAll(pattern))
    videos.push([match[1], match[2], match[3], match[4], match[5], match[6]]);
  return videos;
}

function formatVideo(uri, duration, name, author, target, tags) {
  const seconds = duration.split(/:/).reduce((acc, time) => 60 * acc + +time);
  return new EmbedBuilder()
    .setColor(0xdbc300)
    .setAuthor({ name: author, iconURL: null })
    .setTitle(`${decode(name)} (${duration})`)
    .setURL(`https://youtu.be/${uri}`)
    .setThumbnail(`https://img.youtube.com/vi/${uri}/0.jpg`)
    .addFields({ name: "Target", value: title(target), inline: true });
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function title(str) {
  return str
    .split(/ /)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("video")
    .setDescription("Search chess videos")
    .addStringOption((option) =>
      option.setName("query").setDescription("The search keywords")
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const result = await video(
      interaction.user,
      interaction.options.getString("query"),
      interaction
    );
    await interaction.editReply(result);
  },
};
