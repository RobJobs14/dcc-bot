const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pgn")
    .setDescription("Pgn commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("gif")
        .setDescription("Get the GIF of a PGN")
        .addStringOption((option) =>
          option
            .setName("pgn")
            .setDescription("The moves to view")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("fen").setDescription("The starting position")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Display the PGN on an board (coming soon)")
        .addStringOption((option) =>
          option
            .setName("pgn")
            .setDescription("The moves to view")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("fen").setDescription("The starting position")
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "gif") {
      const pgn = interaction.options.getString("pgn");
      const fen = interaction.options.getString("fen");

      // Create variables to hold the header and PGN text
      let headerTags = "";
      let pgnText = pgn;

      // Check if the user provided a FEN, and add it to the header tags if so
      if (fen) {
        headerTags += `[FEN "${fen}"]\n`;
      }

      // Check if the user provided any header tags in the PGN, and add them if not
      if (!pgn.includes("[White") && !pgn.includes("[Black")) {
        headerTags += `[White "White"]\n[Black "Black"]\n`;
      }

      // Combine the header tags and PGN text into the final PGN string
      pgnText = headerTags + pgnText;

      const params = new URLSearchParams();
      params.append("pgn", `${pgnText}`);
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
    } else if (subcommand === "view") {
      const pgn = interaction.options.getString("pgn");
      const fen = interaction.options.getString("fen");

      // Create variables to hold the header and PGN text
      let headerTags = "";
      let pgnText = pgn;

      // Check if the user provided a FEN, and add it to the header tags if so
      if (fen) {
        headerTags += `[FEN "${fen}"]\n`;
      }

      // Check if the user provided any header tags in the PGN, and add them if not
      if (!pgn.includes("[White") && !pgn.includes("[Black")) {
        headerTags += `[White "White"]\n[Black "Black"]\n`;
      }

      // Combine the header tags and PGN text into the final PGN string
      pgnText = headerTags + pgnText;

      // Define a function to generate a new embed with the current position
      const generateEmbed = (fen, moveList, pageNum) => {
        // Create the FEN image URL
        const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
          fen
        )}`;

        // Create the description text with the move list and page number
        const description = moveList
          .slice((pageNum - 1) * 5, pageNum * 5)
          .map((move, i) => `${(pageNum - 1) * 5 + i + 1}. ${move}`)
          .join("\n");

        // Create the embed and set its properties
        const embed = new EmbedBuilder()
          .setColor("0xdbc300")
          .setDescription(description)
          .setImage(imageURL);

        // Create the button row with the correct button states
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("doubleleft")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⏪")
              .setDisabled(pageNum === 1)
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId("left")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("◀️")
              .setDisabled(pageNum === 1)
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId("right")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("▶️")
              .setDisabled(pageNum === Math.ceil(moveList.length / 5))
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId("doubleright")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⏩")
              .setDisabled(pageNum === Math.ceil(moveList.length / 5))
          );

        // Add the button row to the embed
        embed.addComponents(row);

        // Return the embed
        return embed;
      };

      // Parse the PGN to get the move list
      const moves = pgn
        .match(/\d+\..+?(?=\d+\.|\s*$)/g)
        .map((move) => move.trim());

      // Set the initial page number to 1
      let pageNum = 1;

      // Generate the initial embed with the current position and move list
      const initialEmbed = generateEmbed(fen, moves, pageNum);

      // Send the initial embed
      const message = await interaction.reply({ embeds: [initialEmbed] });

      // Define a collector for button interactions
      const buttonCollector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      // Define a function to handle button interactions
      const handleButton = async (interaction, fen, moves, pageNum) => {
        // Handle the button based on its custom ID
        switch (interaction.customId) {
          case "doubleleft":
            pageNum = 1;
            break;
          case "left":
            pageNum -= 1;
            break;
          case "right":
            pageNum += 1;
            break;
          case "doubleright":
            pageNum = Math.ceil(moves.length / 5);
            break;
        }
        // Generate a new embed with the updated page number
        const newEmbed = generateEmbed(fen, moves, pageNum);

        // Edit the original message with the new embed
        await interaction.update({ embeds: [newEmbed] });
      };

      // Add a listener for button interactions
      buttonCollector.on("collect", async (interaction) => {
        await handleButton(interaction, fen, moves, pageNum);
      });

      // Add a listener for button interaction errors
      buttonCollector.on("collectError", (error) => {
        console.error(error);
      });

      // Add a listener for the button collector to end
      buttonCollector.on("end", () => {
        console.log("Button collector ended");
      });
    } else {
      // If the subcommand is not recognized, send an error message
      await interaction.reply({
        content:
          "Invalid subcommand. Available subcommands: board, pgn, fen, view",
        ephemeral: true,
      });
    }
  },
};
