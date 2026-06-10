const express = require("express")
const { getUserById } = require("../controllers/message.controller")
const verifyToken = require("../middleware/verifyToken.middleware")
const upload = require("../middleware/multer.middleware")
const uploadToCloudinary = require("../middleware/cloudinary.middleware")

const router = express.Router()

router.get("/users/:id", verifyToken, getUserById)


module.exports = router;