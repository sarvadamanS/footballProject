const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3001;

const connectDB = require("./db");
const User = require("./db_models/User.js");
const UserProfile = require("./db_models/UserProfile.js");
const Token = require("./db_models/UserToken.js");
const Post = require("./db_models/Post.js");

const authMiddleware = require("./middleware/authMiddleware.js");
const errorHandler = require("./utils/errorHandler.js");

let server;
const app = express();

//Connecting the Database
connectDB();
// Have Node serve the files for our built React app
const createUser = async function () {
  const user = await User.create({
    username: "sarvadaman",
    password: "student123",
    role: "user",
  });
  // const users = await Token.find({ user: "65d74abfd3ca626e034632e0" });
  // console.log(users);
};
// createUser();

const generateToken = async (user) => {
  try {
    console.log(user);
    const userTokenExists = await Token.findOne({
      user: user._id,
    });
    // console.log("does token exist", userTokenExists);
    if (userTokenExists?.token) {
      console.log("already exists");
      console.log(userTokenExists.token);
      return userTokenExists.token;
    }
    // const token = uuid(); // generate a random token string using the uuid library
    const token = jwt.sign({ userId: user._id, role: user.role }, "secret");
    const tokenDoc = new Token({
      user: user._id,
      token: token,
    });
    console.log(tokenDoc);
    await tokenDoc.save();
    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getUserCredentials = async (user) => {
  try {
    let { userName, password } = user;
    // console.log(userName, password);
    const users = await User.findOne({ username: userName }); // Use the find() method to retrieve all documents from the User collection
    // console.log("Details users:", users);
    if (!user) {
      return null;
    }
    if (users.password === password) {
      return users;
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
  }
};

async function createGoogleUser(email) {
  try {
    // Check if the user already exists
    let user = await User.findOne({ googleId: email });
    if (user) {
      console.log("User already exists");
      return user;
    }

    // If the user doesn't exist, create a new user
    user = new User({
      googleId: email,
      role: "user",
    });

    // Save the new user to the database
    await user.save();
    console.log("User created successfully");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    console.log(response);
    if (response.ok) {
      const userInfo = await response.json();
      console.log("User info:", userInfo);
      return createGoogleUser(userInfo.email);
      // Here you can extract user email, name, and other details from userInfo
    } else {
      return console.error("Failed to fetch user info:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../dist")));
// app.use("/users", authMiddleware);

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  const { user, gender } = req.query;
  console.log(user, gender);
  // console.log(Post);
  res.json({
    message: `Hello from server!${gender === "female" ? "Mrs" : "Mr"} ${user}`,
  });
});

app.get("/get-posts", async (req, res) => {
  try {
    const allPosts = await Post.find({});
    if (allPosts) {
      res.json({ data: allPosts });
    }
  } catch (err) {
    // Handle errors
    errorHandler(err, res, 500);
  }
});
app.get("/users/get-posts", authMiddleware, async (req, res) => {
  try {
    console.log(req.body.user);
    const allPosts = await Post.find({});
    if (allPosts) {
      res.json({ data: allPosts, user: req.body.user });
    }
  } catch (err) {
    // Handle errors
    errorHandler(err, res, 500);
  }
});
app.get("/users/get-profile", authMiddleware, async (req, res) => {
  try {
    const curUserProfile = await UserProfile.findOne({ user: req.body.user });
    if (!curUserProfile) {
      const newProfile = await UserProfile.create({
        user: req.body.user,
        userName: "",
        favoriteClub: "",
        favoritePlayer: "",
        jerseyNumber: 7,
        startedFollowing: 2024,
      });
      res.json(newProfile);
    }
    if (curUserProfile) {
      res.json(curUserProfile);
    }
  } catch (err) {
    // Handle errors
    errorHandler(err, res, 500);
  }
});
app.post("/users/update-profile", authMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    const curUserProfile = await UserProfile.findOneAndUpdate(
      { user: req.body.user },
      req.body,
      { new: true, runValidators: true }
    );
    if (!curUserProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User profile updated successfully", curUserProfile });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      errorHandler(error, res, 400);
    } else {
      errorHandler(error, res, 500);
    }
  }
});
// app.options("/login", cors(corsOptions));
// app.options("/users/create-post", cors(corsOptions));

app.post("/users/create-post", authMiddleware, async (req, res) => {
  try {
    // Process the request and send a response
    const postDoc = new Post(req.body);
    await postDoc.save();
    if (postDoc) {
      res.json({ message: "Post created successfully" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      errorHandler(error, res, 400);
    } else {
      errorHandler(error, res, 500);
    }
  }
});
app.post("/users/update-post", authMiddleware, async (req, res) => {
  try {
    // Process the request and send a response
    console.log(req.body);
    const updatedDoc = await Post.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Document updated successfully", updatedDoc });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      errorHandler(error, res, 400);
    } else {
      errorHandler(error, res, 500);
    }
  }
});

app.post("/users/posts/like", authMiddleware, async (req, res) => {
  try {
    // Process the request and send a response
    console.log(req.body);
    // Process the request and send a response
    const postId = req.body.id; // Assuming 'id' is the post ID passed in the request body
    const userId = req.body.user; // Assuming 'id' is the user ID stored in the request object by auth middleware

    // Add the like to the post's likes array
    const result = await Post.updateOne(
      { _id: postId },
      { $addToSet: { likes: { user: userId } } }
    );

    // Check if any post was updated
    if (result.nModified === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      errorHandler(error, res, 400);
    } else {
      errorHandler(error, res, 500);
    }
  }
});
app.post("/users/posts/unlike", authMiddleware, async (req, res) => {
  try {
    // Process the request and send a response
    const postId = req.body.id; // Assuming 'id' is the post ID passed in the request body
    const userId = req.body.user; // Assuming 'id' is the user ID stored in the request object by auth middleware

    // Remove the like from the post's likes array
    const result = await Post.updateOne(
      { _id: postId },
      { $pull: { likes: { user: userId } } }
    );

    // Check if any post was updated
    if (result.nModified === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      errorHandler(error, res, 400);
    } else {
      errorHandler(error, res, 500);
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    // Perform asynchronous operation (e.g., database query)
    let { mode } = req.query;
    let user;
    console.log(mode);
    if (mode === "google") {
      let { googleAccessToken } = req.body;
      user = await getGoogleUserInfo(googleAccessToken);
    } else {
      user = await getUserCredentials(req.body);
    }
    console.log(user);
    if (user) {
      let token = await generateToken(user);
      console.log(token);
      if (token) {
        res.json({
          message: "Successfully logged in as: " + user.username,
          token: token,
        });
      } else {
        res.json({ message: "Couldnt generate the token", error: "Fatal" });
      }
    } else {
      res.json({
        message: "User not found or invalid credentials",
        error: "Fatal",
      });
    }
    // Send response once asynchronous operation is complete
  } catch (error) {
    errorHandler(err, res, 500);
  }
});

//Handle requests with routing
app.use("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  console.log(req.params);
  res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
});

server = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
// getAllUsers();
//Handling error
process.on("uncaughtException", (err) => {
  console.error(`An uncaught exception occurred: ${err.message}`);
  // Close the server before exiting
  server.close(() => {
    process.exit(1);
  });
});
