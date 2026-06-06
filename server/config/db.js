const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
     console.log("MONGO_URI:", process.env.MONGO_URI);
    // await mongoose.connect("mongodb://localhost:27017/chatingApp"); 
    await mongoose.connect(process.env.MONGO_URI, 
      // { serverSelectionTimeoutMS: 30000, } 
    );
    console.log("MongoDB Connected");
  } catch (error) {
    // console.log(error);
    console.log("MongoDB Error:", error);
  }
};

module.exports = dbConnect;
