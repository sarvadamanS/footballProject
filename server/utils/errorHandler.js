const errorHandler = (err, res, statusCode) => {
  console.error("Custom Error:", err);
  res
    .status(statusCode)
    .json({ message: "Internal server error", error: err.message });
};
module.exports = errorHandler;
