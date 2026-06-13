const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { getIO } = require("../services/socket")

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({
            message: "user get successfully",
            data: user,
        });
    } catch (error) {
        console.log("error getUserById ", error.message);
        res.status(500).json({ message: error.message });
    }
};
const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id

        const receiver = await User.findById(receiverId)
        if (!receiver) {
            res.status(404).json({ message: "Receiver not found" })
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text || "",
            imageUrl: req.imageUrl,
            videoUrl: req.videoUrl,
            audioUrl: req.audioUrl

        })
        let io = getIO()
        io.to(receiverId.toString()).emit("newMessage", newMessage)
        console.log("socket event");

        res.status(200).json({
            message: "message send successfully",
            data: newMessage,
        });
    } catch (error) {
        console.log("error sendMessage ", error.message);
        res.status(500).json({ message: error.message });
    }
};
const getMessage = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { userId } = req.params
        const message = await Message.find({
            $or: [
                { senderId: logingUserId, receiverId: userId },
                { senderId: userId, receiverId: logingUserId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "message get successfully",
            data: message,
        });
    } catch (error) {
        console.log("error getMessage ", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserById, sendMessage, getMessage };
