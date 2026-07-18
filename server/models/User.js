const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "Hey there! I am using ChatingApp.",
      trim: true,
      maxlength: 140,
    },
    googleId: {
      type: String,
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);

module.exports = User;
