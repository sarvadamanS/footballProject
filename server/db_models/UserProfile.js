const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userName: {
    type: String,
    maxlength: 30, // Maximum 50 characters for userName
  },
  favoriteClub: {
    type: String,
    maxlength: 30, // Maximum 100 characters for favoriteClub
  },
  favoritePlayer: {
    type: String,
    maxlength: 30, // Maximum 100 characters for favoritePlayer
  },
  jerseyNumber: {
    type: Number,
    min: 1, // Minimum jerseyNumber allowed
    max: 99, // Maximum jerseyNumber allowed
    default: 7,
  },
  startedFollowing: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
