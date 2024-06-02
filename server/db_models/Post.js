const mongoose = require("mongoose");

// Define schema for comments
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define schema for likes
const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
});

// Define schema for posts
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: String,
  fixture: String,
  picture: String,
  body: {
    type: String,
    required: true,
    minlength: [100, "Body must be at least 100 characters long"],
    maxlength: [500, "Body cannot exceed 500 characters"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  comments: [commentSchema],
  likes: [likeSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model for Post

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
