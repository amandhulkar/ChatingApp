const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/chatingApp"); 

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = dbConnect;
