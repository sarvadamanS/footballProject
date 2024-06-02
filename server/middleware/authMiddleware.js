const Token = require("../db_models/UserToken.js");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    // const tokenDoc = await Token.findOne({ token: token }).populate("user");
    const tokenDoc = await Token.findOne({
      token: token.trim(),
    });
    console.log("token found", tokenDoc);
    if (!tokenDoc) {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (tokenDoc.user) {
      req.body.user = tokenDoc.user;
    }
    console.log("you are authorised");
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
module.exports = authMiddleware;
