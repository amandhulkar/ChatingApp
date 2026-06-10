const jwt = require("jsonwebtoken")
const User = require("../models/User")

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.headers?.token || socket.handshake.auth?.token;
    console.log("socket headers token", socket.handshake.headers.token)
    console.log("socket auth token", socket.handshake.auth?.token)

    if (!token) {
      return next(new Error("No token provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user;
    socket.userId = user._id;
    next()
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(new Error("Unauthorized"));
  }
}
module.exports = socketAuth;