const express = require("express")
const { createGroup, getMyGroups, getGroup, sendGroupMessage, getGroupMessages } = require("../controllers/group.controller");
const upload = require("../middleware/multer.middleware");
const uploadToCloudinary = require("../middleware/cloudinary.middleware");
const verifyToken = require("../middleware/verifyToken.middleware");

const router = express.Router()

router.post("/create-group", verifyToken, upload.single("group_icon"), uploadToCloudinary, createGroup)
router.get("/my-groups", verifyToken, getMyGroups)
router.get("/get-group/:groupId", verifyToken, getGroup)
router.post("/send-group-message/:groupId", verifyToken, upload.array("files"), uploadToCloudinary, sendGroupMessage)
router.get("/get-group-messages/:groupId", verifyToken, getGroupMessages)

module.exports = router;
