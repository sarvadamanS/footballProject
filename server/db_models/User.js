// user.js
const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    minLength: 6,
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
});

const User = Mongoose.model("user", UserSchema);
module.exports = User;
