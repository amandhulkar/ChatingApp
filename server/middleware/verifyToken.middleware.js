const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided , authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    // console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    const user = await User.findById(decoded.userId).select("-password");
    // console.log(user)

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("jwt verification error", error.message);
  }
};
module.exports = verifyToken;
