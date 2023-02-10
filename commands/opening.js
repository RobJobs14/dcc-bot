const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const { LICHESS_TOKEN: litoken } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("opening")
    .setDescription("Get a GIF of an opening")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Query type")
        .setRequired(true)
        .addChoices(
          { name: "opening name", value: "name" },
          { name: "ECO code", value: "eco" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("Opening name or ECO code")
        .setRequired(true)
    ),

  async execute(interaction) {
    const queryType = interaction.options.getString("query");
    const queryValue = interaction.options.getString("term");

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

    // Iterate over the lines and find the one that matches the query value
    let pgn = null;
    let ecoValue = null;
    let nameValue = null;
    for (const line of lines) {
      const [eco, name, pgnValue] = line.split("\t");
      if (
        (queryType === "eco" && eco === queryValue) ||
        (queryType === "name" &&
          name.toLowerCase().replace(/[':]/g, "") ===
            queryValue.toLowerCase().replace(/[':]/g, ""))
      ) {
        pgn = pgnValue;
        ecoValue = eco;
        nameValue = name;
        break;
      }
    }

    // Reply to the user with the PGN if it was found, otherwise reply with an error message
    if (pgn) {
      const params = new URLSearchParams();
      params.append(
        "pgn",
        `[White "${pgn}"][Black "${ecoValue} ${nameValue}"] ${pgn}`
      );
      const response = await fetch("https://lichess.org/api/import", {
        method: "POST",
        body: params,
        headers: {
          Authorization: `Bearer ${litoken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => response.json())
        .then((pgn) => {
          const id = pgn.id;
          interaction.reply(
            `https://lichess1.org/game/export/gif/${id}.gif?theme=brown&piece=cburnett`
          );
        });
    } else {
      interaction.reply("No matching opening was found.");
    }
  },
};
