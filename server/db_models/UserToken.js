const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 * 12, // token will expire in 1 hour
  },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
