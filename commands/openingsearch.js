const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const FIELDS_PER_PAGE = 10;

const { LICHESS_TOKEN: litoken } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("openingsearch")
    .setDescription("Search an opening")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Opening name or ECO code")
        .setRequired(true)
    ),

  async execute(interaction) {
    const queryValue = interaction.options.getString("query");

    // Read the tsv files in the folder and store their content in an array
    const openings = fs
      .readdirSync(path.join("/home/zexi/dcc-bot/openings"))
      .filter((file) => file.endsWith(".tsv"))
      .map((file) =>
        fs.readFileSync(path.join("/home/zexi/dcc-bot/openings", file), "utf-8")
      );

    // Concatenate all tsv file contents into a single string
    const tsvContent = openings.join("\n");

    // Split the string into lines and remove the first line (header)
    const lines = tsvContent.split("\n").slice(1);

    // Iterate over the lines and find the ones that match the query value
    let matchingOpenings = [];
    let index = 1;
    let pgn = null;

    for (const line of lines) {
      const [eco, name, pgnValue] = line.split("\t");
      if (
        eco.toLowerCase().includes(queryValue.toLowerCase()) ||
        name
          .toLowerCase()
          .replace(/[':,-]/g, "")
          .includes(queryValue.toLowerCase().replace(/[':,-]/g, ""))
      ) {
        matchingOpenings.push({
          name: `${index}. ${eco} ${name}`,
          value: pgnValue,
        });
        index++;
        pgn = pgnValue;
      }
    }

    // Paginate the list of matching openings
    if (pgn) {
      const numFields = matchingOpenings.length;
      const numPages = Math.ceil(numFields / FIELDS_PER_PAGE);
      let page = 1;
      let start = 0;
      let end = Math.min(start + FIELDS_PER_PAGE, numFields);

      // Create the embed and buttons for the first page
      const embed = new EmbedBuilder()
        .setColor("0xdbc300")
        .addFields(
          ...matchingOpenings
            .slice(start, end)
            .map((opening) => [opening, { name: "\n", value: "\n" }])
            .flat()
            .slice(0, -1) // remove the last blank field
        )
        .setFooter({
          text: `Page ${page} of ${numPages}. Type a number to view it!`,
        });

      interaction.client.buttons = new Collection();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("doubleleft")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`⏪`)
            .setDisabled(true)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("left")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`◀️`)
            .setDisabled(true)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("right")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`▶️`)
            .setDisabled(numPages === 1)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("doubleright")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("⏩")
            .setDisabled(numPages === 1)
        );

      interaction.client.buttons.set("doubleleft", row);
      interaction.client.buttons.set("left", row);
      interaction.client.buttons.set("right", row);
      interaction.client.buttons.set("doubleright", row);

      // Send the initial embed and buttons
      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      // Create a collector for button interactions
      const buttonCollector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      buttonCollector.on("collect", async (interaction) => {
        // Handle button interactions
        switch (interaction.customId) {
          case "left":
            // Go to the previous page
            page--;
            start = (page - 1) * FIELDS_PER_PAGE;
            end = Math.min(start + FIELDS_PER_PAGE, numFields);
            break;

          case "right":
            // Go to the next page
            page++;
            start = (page - 1) * FIELDS_PER_PAGE;
            end = Math.min(start + FIELDS_PER_PAGE, numFields);
            break;

          case "doubleleft":
            // Go to the first page
            page = 1;
            start = 0;
            end = Math.min(start + FIELDS_PER_PAGE, numFields);
            break;

          case "doubleright":
            // Go to the last page
            page = numPages;
            end = numFields;
            start = end - (end % FIELDS_PER_PAGE);
            if (start === end) {
              start = end - FIELDS_PER_PAGE;
            }
            break;
        }

        // Update the embed and buttons
        embed.spliceFields(
          0,
          numFields,
          ...matchingOpenings
            .slice(start, end)
            .map((opening) => [
              opening,
              { name: "\n", value: "\n", inline: false },
            ])
            .flat()
            .slice(0, -1)
        );

        row.components[0].setDisabled(page === 1);
        row.components[1].setDisabled(page === 1);
        row.components[2].setDisabled(page === numPages);
        row.components[3].setDisabled(page === numPages);

        await interaction.update({
          embeds: [embed],
          components: [row],
        });
      });

      buttonCollector.on("end", async () => {
        // Remove the buttons when the collector ends
        row.components.forEach((component) => component.setDisabled(true));

        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
      });

      // Create a filter for the message collector
      const filter = (m) =>
        !m.author.bot &&
        !isNaN(m.content) &&
        Number(m.content) <= matchingOpenings.length;

      // Create the message collector
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 300000,
      });

      collector.on("collect", async (m) => {
        const selected = Number(m.content) - 1;
        const selectedOpening = matchingOpenings[selected];

        const { getStats } = await import("../stats.mjs");
        const [data1, data2] = await getStats(selectedOpening.value);

        const params = new URLSearchParams();
        params.append(
          "pgn",
          `[White "${data2}"] [Black "${data1}"] ${selectedOpening.value}`
        );
        const response = await fetch("https://lichess.org/api/import", {
          method: "POST",
          body: params,
          headers: {
            Authorization: `Bearer ${litoken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const pgn = await response.json();
        const id = pgn.id;
        const imageURL = `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`;

        const openingEmbed = new EmbedBuilder()
          .setColor("0xdbc300")
          .setTitle(selectedOpening.name.substring(3))
          .setDescription(selectedOpening.value)
          .setImage(imageURL);

        m.reply({ embeds: [openingEmbed] });
      });
    } else {
      interaction.reply("No matching opening was found.");
    }
  },
};
