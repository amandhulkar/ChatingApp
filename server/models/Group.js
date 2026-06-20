const mongoose = require("mongoose")

const groupSchema = new mongoose.Schema({
    group_name: {
        type: String
    },
    group_icon: {
        type: String
    },
    des: {
        type: String
    },
    group_admin: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    group_member: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
},
    { timestamps: true }
)
const Group = mongoose.model("Group", groupSchema)
module.exports = Group;