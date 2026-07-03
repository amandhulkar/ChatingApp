const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./config/db");
const authRoutes = require("./routes/auth.route");
const messageRoute = require("./routes/message.route");

const groupRoute = require("./routes/group.route")


const cors = require("cors");
const { initSocket } = require("./services/socket");

const { createServer } = require("http");

dotenv.config();

let PORT = process.env.PORT || 4000;

const app = express();  
const server = createServer(app);

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api", messageRoute);
app.use("/api", groupRoute) 

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

initSocket(server);

server.listen(PORT, async () => {
  try {
    await dbConnect();
    console.log(`server is running port ${PORT}`);
  } catch (error) {
    console.error("Failed to start server because MongoDB connection failed.");
    process.exit(1);
  }
});
