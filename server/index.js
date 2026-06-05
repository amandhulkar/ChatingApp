const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();

dotenv.config();

const dbConnect = require("./config/db");

const authRoutes = require("./routes/auth.route");

app.use(express.json());

app.use(cors());

app.use("/api", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);

  dbConnect();
});
