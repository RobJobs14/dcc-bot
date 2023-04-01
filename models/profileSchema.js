const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const profileSchema = new mongoose.Schema({
  userId: { type: String, require: true, unique: true },
  serverId: { type: String, require: true },
  chesscomUsername: { type: String },
  lichessUsername: { type: String },
});

const model = mongoose.model("dcc-bot", profileSchema);

module.exports = model;
