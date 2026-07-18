const Message = require("../models/Message");
const User = require("../models/User");
const { getIO } = require("../services/socket")

const getDirectChatQuery = (userOne, userTwo) => ({
    $or: [
        { senderId: userOne, receiverId: userTwo },
        { senderId: userTwo, receiverId: userOne }
    ]
})

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id
        const loginUserId = req.user._id
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const me = await User.findById(loginUserId).select("blockedUsers")
        const blockedByMe = me?.blockedUsers?.some((id) => id.toString() === userId.toString()) || false
        const hasBlockedMe = user?.blockedUsers?.some((id) => id.toString() === loginUserId.toString()) || false

        res.status(200).json({
            message: "user get successfully",
            data: user,
            relationship: {
                blockedByMe,
                hasBlockedMe
            }
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
            return res.status(404).json({ message: "Receiver not found" })
        }

        const sender = await User.findById(senderId).select("blockedUsers")
        const senderBlockedReceiver = sender?.blockedUsers?.some((id) => id.toString() === receiverId.toString())
        const receiverBlockedSender = receiver?.blockedUsers?.some((id) => id.toString() === senderId.toString())

        if (senderBlockedReceiver) {
            return res.status(403).json({ message: "You blocked this user. Unblock to send messages." })
        }

        if (receiverBlockedSender) {
            return res.status(403).json({ message: "You cannot send messages to this user." })
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
        await Message.updateMany(
            { senderId: userId, receiverId: logingUserId, seen: false, deletedFor: { $ne: logingUserId } },
            { seen: true }
        );

        const message = await Message.find({
            ...getDirectChatQuery(logingUserId, userId),
            deletedFor: { $ne: logingUserId }
        }).sort({ createdAt: 1 });

        res.status(200).json({
            message: "message get successfully",
            data: message,
        });
    } catch (error) {
        console.log("error getMessage ", error.message);
        res.status(500).json({ message: error.message });
    }
};

const clearChat = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { userId } = req.params
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const result = await Message.updateMany(
            {
                ...getDirectChatQuery(logingUserId, userId),
                deletedFor: { $ne: logingUserId }
            },
            {
                $addToSet: { deletedFor: logingUserId },
                deletedAt: new Date(),
                deletedBy: logingUserId
            }
        )

        res.status(200).json({
            message: "Chat cleared successfully",
            modifiedCount: result.modifiedCount
        })
    } catch (error) {
        console.log("error clearChat ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const deleteChat = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { userId } = req.params
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const result = await Message.updateMany(
            {
                ...getDirectChatQuery(logingUserId, userId),
                deletedFor: { $ne: logingUserId }
            },
            {
                $addToSet: { deletedFor: logingUserId },
                deletedAt: new Date(),
                deletedBy: logingUserId
            }
        )

        res.status(200).json({
            message: "Chat deleted successfully",
            modifiedCount: result.modifiedCount
        })
    } catch (error) {
        console.log("error deleteChat ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const blockUser = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { userId } = req.params

        if (logingUserId.toString() === userId.toString()) {
            return res.status(400).json({ message: "You cannot block yourself" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        await User.findByIdAndUpdate(logingUserId, {
            $addToSet: { blockedUsers: userId }
        })

        res.status(200).json({ message: "User blocked successfully" })
    } catch (error) {
        console.log("error blockUser ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const unblockUser = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { userId } = req.params

        await User.findByIdAndUpdate(logingUserId, {
            $pull: { blockedUsers: userId }
        })

        res.status(200).json({ message: "User unblocked successfully" })
    } catch (error) {
        console.log("error unblockUser ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const deleteMessage = async (req, res) => {
    try {
        const logingUserId = req.user._id
        const { messageId } = req.params

        const message = await Message.findOneAndUpdate(
            {
                _id: messageId,
                $or: [
                    { senderId: logingUserId },
                    { receiverId: logingUserId }
                ]
            },
            {
                $addToSet: { deletedFor: logingUserId },
                deletedAt: new Date(),
                deletedBy: logingUserId
            },
            { new: true }
        )

        if (!message) {
            return res.status(404).json({ message: "Message not found" })
        }

        res.status(200).json({
            message: "Message deleted successfully",
            data: message
        })
    } catch (error) {
        console.log("error deleteMessage ", error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getUserById, sendMessage, getMessage, clearChat, deleteChat, blockUser, unblockUser, deleteMessage };
