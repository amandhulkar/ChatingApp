const express = require("express")
const { getUserById, sendMessage, getMessage, clearChat, deleteChat, blockUser, unblockUser, deleteMessage } = require("../controllers/message.controller")
const verifyToken = require("../middleware/verifyToken.middleware")
const upload = require("../middleware/multer.middleware")
const uploadToCloudinary = require("../middleware/cloudinary.middleware")

const router = express.Router()

router.get("/users/:id", verifyToken, getUserById)
router.patch("/users/:userId/block", verifyToken, blockUser)
router.patch("/users/:userId/unblock", verifyToken, unblockUser)
router.post("/send-message/:receiverId", verifyToken, upload.array("files"), uploadToCloudinary, sendMessage)
router.get("/get-message/:userId", verifyToken, getMessage)
router.patch("/chats/:userId/clear", verifyToken, clearChat)
router.delete("/chats/:userId", verifyToken, deleteChat)
router.delete("/messages/:messageId", verifyToken, deleteMessage)

module.exports = router;