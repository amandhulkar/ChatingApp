const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./config/db");
const authRoutes = require("./routes/auth.route");

const cors = require("cors");

dotenv.config();

let PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  dbConnect();
});
