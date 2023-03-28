const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
} = require("discord.js");

const { LICHESS_TOKEN: litoken } = process.env;

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
        .setDescription("Display a PGN on a board")
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
      const pgnInput = interaction.options.getString("pgn");
      let fen = interaction.options.getString("fen");
      let convertedPgn = "";
      let finalPgn = "";

      // Create variables to hold the header and PGN text
      let headerTags = "";
      let pgnText = pgnInput;

      // Check if the user provided a FEN, and add it to the header tags if so
      if (fen) {
        headerTags += `[FEN "${fen}"]\n`;
      }

      // Check if the user provided any header tags in the PGN, and add them if not
      if (!pgnInput.includes("[White") && !pgnInput.includes("[Black")) {
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
        .then(async (pgn) => {
          const id = pgn.id;
          const taglessResponse = await fetch(
            `https://lichess.org/game/export/${id}?pgnInJson=true&tags=false&clocks=false&evals=false&opening=false`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
            .then((res) => res.json())
            .catch((err) => {
              console.error(err);
              return {};
            });
          const tagResponse = await fetch(
            `https://lichess.org/game/export/${id}?pgnInJson=true&clocks=false&evals=false`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
            .then((res) => res.json())
            .catch((err) => {
              console.error(err);
              return {};
            });
          finalPgn = tagResponse.pgn
            .replaceAll("\n", "")
            .replace(/\[.*?\]/g, "")
            .replace(/\*/g, "");

          convertedPgn = taglessResponse.pgn.replace(/\n/g, "");
        });

      if (!fen) {
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      }

      const pgn = convertedPgn;

      // Get the array of updated FENs
      const { updateFen } = await import("../fen.mjs");
      const updatedFens = await updateFen(pgn, fen);

      // Split the PGN into individual moves
      const moves = pgn
        .split(/\d+\./)
        .filter((move) => move.trim().length > 0)
        .map((move) => move.trim())
        .flatMap((move) => move.split(/\s+/))
        .map((move) => move.replace(/^\d+\./, ""));

      // Add null move representing starting position
      moves.unshift(null);

      // Initialize the current move index
      let currentMoveIndex = 0;
      currentFen = updatedFens[currentMoveIndex].fen;

      // Get the initial position image
      const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
        currentFen
      )}`;
      const image = new EmbedBuilder().setImage(imageURL);

      // Create the initial embed with the image and the first move

      const description = "```ini\n" + finalPgn + "\n```";

      const embed = new EmbedBuilder()
        .setDescription(description)
        .setImage(imageURL);

      // Create the button row
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("doubleleft")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`⏪`)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("left")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`◀️`)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("right")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`▶️`)
          .setDisabled(moves.length === 1),
        new ButtonBuilder()
          .setCustomId("doubleright")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⏩")
          .setDisabled(moves.length === 1),
        new ButtonBuilder()
          .setCustomId("rotate")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`🔄`)
      );

      const analyze = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(`https://www.chess.com/analysis?fen=${encodeURI(currentFen)}`)
          .setLabel(`:chesscom: Analyze on Chess.com`)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setURL(`https://lichess.org/analysis?fen=${encodeURI(currentFen)}`)
          .setLabel(`Analyze on Lichess`)
          .setStyle(ButtonStyle.Link)
      );

      const chesssable = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(
            `https://www.chessable.com/courses/?fen=${encodeURI(currentFen)}`
          )
          .setLabel(`Search on Chessable`)
          .setStyle(ButtonStyle.Link)
      );

      // Save the button row to the client for later reference
      interaction.client.buttons = new Collection();
      interaction.client.buttons.set("doubleleft", row);
      interaction.client.buttons.set("left", row);
      interaction.client.buttons.set("right", row);
      interaction.client.buttons.set("doubleright", row);
      interaction.client.buttons.set("rotate", row);

      // Send the initial embed and buttons
      const message = await interaction.reply({
        embeds: [embed],
        components: [row, analyze, chesssable],
      });

      // Create a collector for button interactions
      const buttonCollector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      let updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("doubleleft")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`⏪`),
        new ButtonBuilder()
          .setCustomId("left")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`◀️`),
        new ButtonBuilder()
          .setCustomId("right")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`▶️`),
        new ButtonBuilder()
          .setCustomId("doubleright")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`⏩`),
        new ButtonBuilder()
          .setCustomId("rotate")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`🔄`)
      );

      let rotated = false;

      buttonCollector.on("collect", async (interaction) => {
        // Update the current move index and FEN based on the button pressed
        switch (interaction.customId) {
          case "doubleleft":
            currentMoveIndex = 0;
            currentFen = updatedFens[currentMoveIndex].fen;
            break;
          case "left":
            currentMoveIndex = Math.max(0, currentMoveIndex - 1);
            currentFen = updatedFens[currentMoveIndex].fen;
            break;
          case "right":
            currentMoveIndex = Math.min(moves.length - 1, currentMoveIndex + 1);
            currentFen = updatedFens[currentMoveIndex].fen;
            break;
          case "doubleright":
            currentMoveIndex = moves.length - 1;
            currentFen = updatedFens[currentMoveIndex].fen;
            break;
          case "rotate":
            // Toggle the rotated state
            rotated = !rotated;
            break;
        }
        // Update the current FEN based on the current state of rotation
        currentFen = updatedFens[currentMoveIndex].fen.replace(
          /&color=(black|white)/,
          ""
        );
        if (rotated) {
          currentFen += "&color=black";
        }

        // Update the description of the embed
        const searchTerm = moves[currentMoveIndex];
        let updatedPgnList = "";

        // Split pgnList into an array of moves
        const movesArray = finalPgn.split(/\d+\.\s*|\.\.\.|\./).filter(Boolean);

        // Split each move into individual moves
        const individualMoves = movesArray
          .map((move) => move.trim().split(/\s+/))
          .flat()
          .map((move, index) => ({
            number: index + 1,
            value: move,
          }));

        // Find the closest move to the current move index
        const closestMove = individualMoves.reduce(
          (closest, move) => {
            const distance = Math.abs(move.number - currentMoveIndex);
            if (distance < closest.distance) {
              return { move, distance };
            } else {
              return closest;
            }
          },
          { move: null, distance: Infinity }
        ).move;

        if (closestMove && closestMove.value.includes(searchTerm)) {
          const regex = new RegExp(`(${searchTerm})`, "gi");
          const moveNumber = closestMove.number;
          updatedPgnList = finalPgn.replace(regex, (match, p1, offset) => {
            const moveStartIndex = finalPgn.indexOf(closestMove.value);
            const termIndex = closestMove.value.indexOf(searchTerm);
            const termStartIndex = moveStartIndex + termIndex;
            if (
              offset < termStartIndex ||
              offset > termStartIndex + searchTerm.length
            ) {
              return match;
            } else {
              return `[${p1}]`;
            }
          });
        } else {
          updatedPgnList = finalPgn;
        }

        const description = "```ini\n" + updatedPgnList + "\n```";

        const imageURL = `http://lichess1.org/export/fen.gif?fen=${encodeURI(
          currentFen
        )}`;
        const updatedEmbed = new EmbedBuilder()
          .setDescription(description)
          .setImage(imageURL);

        // Update the button row
        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("doubleleft")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`⏪`)
            .setDisabled(currentMoveIndex === 0),
          new ButtonBuilder()
            .setCustomId("left")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`◀️`)
            .setDisabled(currentMoveIndex === 0),
          new ButtonBuilder()
            .setCustomId("right")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`▶️`)
            .setDisabled(currentMoveIndex === moves.length - 1),
          new ButtonBuilder()
            .setCustomId("doubleright")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`⏩`)
            .setDisabled(currentMoveIndex === moves.length - 1),
          new ButtonBuilder()
            .setCustomId("rotate")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`🔄`)
        );

        const updatedAnalyze = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setURL(
              `https://www.chess.com/analysis?fen=${encodeURI(currentFen)}`
            )
            .setLabel(`Analyze on Chess.com`)
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL(`https://lichess.org/analysis?fen=${encodeURI(currentFen)}`)
            .setLabel(`Analyze on Lichess`)
            .setStyle(ButtonStyle.Link)
        );

        const updatedChesssable = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setURL(
              `https://www.chessable.com/courses/?fen=${encodeURI(currentFen)}`
            )
            .setLabel(`Search on Chessable`)
            .setStyle(ButtonStyle.Link)
        );

        // Update the original message with the updated embed and button row
        await interaction.update({
          embeds: [updatedEmbed],
          components: [updatedRow, updatedAnalyze, updatedChesssable],
        });
      });

      buttonCollector.on("end", async (collected) => {
        // Disable all buttons in the button row
        updatedRow.components.forEach((component) =>
          component.setDisabled(true)
        );

        await interaction.editReply({
          embeds: [embed],
          components: [updatedRow],
        });
      });
    }
  },
};
