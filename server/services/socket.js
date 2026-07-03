const { Server } = require("socket.io")
const socketAuth = require("../middleware/socket.auth.middleware")
const Group = require("../models/Group")

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

        socket.on("joinGroup", async (groupId) => {
            try {
                const group = await Group.findById(groupId);
                if (!group) return;

                const isMember = group.group_member.some((member) => member.toString() === userId.toString());
                if (!isMember) return;

                socket.join(`group:${groupId}`);
            } catch (error) {
                console.log("joinGroup error", error.message);
            }
        })

        socket.on("leaveGroup", (groupId) => {
            socket.leave(`group:${groupId}`);
        })

        io.emit("onlineUser", Object.keys(userSocketMap))

        socket.on("disconnect", () => {
            delete userSocketMap[userId];
            io.emit("onlineUser", Object.keys(userSocketMap))
        })
    })
    return io;
}
const getIO = () => {
    return io;
}
module.exports = { initSocket, getIO }
