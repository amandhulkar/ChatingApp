const express = require("express")
const { createGroup, updateGroup, getMyGroups, getGroup, sendGroupMessage, getGroupMessages, addGroupMembers, exitGroup } = require("../controllers/group.controller");
const upload = require("../middleware/multer.middleware");
const uploadToCloudinary = require("../middleware/cloudinary.middleware");
const verifyToken = require("../middleware/verifyToken.middleware");

const router = express.Router()

router.post("/create-group", verifyToken, upload.single("group_icon"), uploadToCloudinary, createGroup)
router.put("/update-group/:groupId", verifyToken, upload.single("group_icon"), uploadToCloudinary, updateGroup)
router.patch("/groups/:groupId/members", verifyToken, addGroupMembers)
router.get("/my-groups", verifyToken, getMyGroups)
router.get("/get-group/:groupId", verifyToken, getGroup)
router.post("/send-group-message/:groupId", verifyToken, upload.array("files"), uploadToCloudinary, sendGroupMessage)
router.get("/get-group-messages/:groupId", verifyToken, getGroupMessages)
router.patch("/groups/:groupId/exit", verifyToken, exitGroup)

module.exports = router;
