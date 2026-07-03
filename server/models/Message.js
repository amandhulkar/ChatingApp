const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    text: {
        type: String
    },
    imageUrl: [{
        type: String
    }],
    videoUrl: [{
        type: String
    }],
    audioUrl: [{
        type: String
    }],
    seen: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })
const Message = mongoose.model("Message", messageSchema)
module.exports = Message