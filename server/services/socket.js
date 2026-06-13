const { Server } = require("socket.io")
const socketAuth = require("../middleware/socket.auth.middleware")

let io;
const userSocketMap = {}
const initSocket = async (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    })
    io.use(socketAuth)

    io.on("connection", (socket) => {
        console.log("user connected", socket.user.fullName);

        const userId = socket.userId
        userSocketMap[userId] = socket.id

        socket.join(userId.toString())

        io.emit("onlineUser", Object.keys(userSocketMap))

        socket.on("disconnect", () => {
            delete userSocketMap[userId];
            // io.emit("onlineUser", Object.keys(userSocketMap))
        })
    })
    return io;
}
const getIO = () => {
    return io;
}
module.exports = { initSocket, getIO }
