const Group = require("../models/Group");

const createGroup = async (req, res) => {
    try {
        const { group_name, group_member } = req.body;
        const adminId = req.user._id
        const members = JSON.parse(group_member)

        const newGroup = await Group.create({
            group_name,
            group_icon: req.imageUrl[0],
            group_member: members,
            group_admin: adminId
        })
        res.status(200).json({
            message: "Group create successfully",
            data: newGroup
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const groups = await Group.findById({ _id: groupId }).lean()

        res.status(200).json({
            message: "fetch group",
            data: groups
        })
        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
module.exports = { createGroup, getGroup }