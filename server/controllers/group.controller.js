const Group = require("../models/Group");
const Message = require("../models/Message");
const User = require("../models/User");
const { getIO } = require("../services/socket");

const getId = (value) => value?._id || value;

const isMember = (group, userId) => {
    return group.group_member.some((member) => getId(member).toString() === userId.toString());
}

const parseMembers = (group_member) => {
    if (!group_member) return [];
    if (Array.isArray(group_member)) return group_member;

    try {
        const parsed = JSON.parse(group_member);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [group_member];
    }
}

const createGroup = async (req, res) => {
    try {
        const { group_name, des } = req.body;
        const adminId = req.user._id;
        const members = parseMembers(req.body.group_member);

        if (!group_name?.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const uniqueMembers = [...new Set([...members.map(String), adminId.toString()])];
        const usersCount = await User.countDocuments({ _id: { $in: uniqueMembers } });

        if (usersCount !== uniqueMembers.length) {
            return res.status(400).json({ message: "Invalid group member selected" });
        }

        const newGroup = await Group.create({
            group_name: group_name.trim(),
            group_icon: req.imageUrl?.[0] || "",
            des: des || "",
            group_member: uniqueMembers,
            group_admin: [adminId]
        })

        const populatedGroup = await Group.findById(newGroup._id)
            .populate("group_member", "fullName profilePic email")
            .populate("group_admin", "fullName profilePic email");

        const io = getIO();
        uniqueMembers.forEach((memberId) => {
            io.to(memberId.toString()).emit("groupCreated", populatedGroup);
        });

        res.status(200).json({
            message: "Group create successfully",
            data: populatedGroup
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ group_member: userId })
            .populate("group_member", "fullName profilePic email")
            .populate("group_admin", "fullName profilePic email")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            message: "Groups fetch successfully",
            data: groups
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId)
            .populate("group_member", "fullName profilePic email")
            .populate("group_admin", "fullName profilePic email");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!isMember(group, req.user._id)) {
            return res.status(403).json({ message: "You are not a group member" });
        }

        res.status(200).json({
            message: "fetch group",
            data: group
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!isMember(group, senderId)) {
            return res.status(403).json({ message: "You are not a group member" });
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            text: text || "",
            imageUrl: req.imageUrl,
            videoUrl: req.videoUrl,
            audioUrl: req.audioUrl
        });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic email");

        await Group.findByIdAndUpdate(groupId, { updatedAt: new Date() });

        const io = getIO();
        io.to(`group:${groupId}`).emit("newGroupMessage", populatedMessage);

        res.status(200).json({
            message: "Group message send successfully",
            data: populatedMessage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!isMember(group, req.user._id)) {
            return res.status(403).json({ message: "You are not a group member" });
        }

        const messages = await Message.find({ groupId })
            .populate("senderId", "fullName profilePic email")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Group messages fetch successfully",
            data: messages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createGroup, getMyGroups, getGroup, sendGroupMessage, getGroupMessages }
