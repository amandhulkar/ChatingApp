const express = require("express")
const {createGroup, getGroup} = require("../controllers/group.controller");
const upload = require("../middleware/multer.middleware");
const uploadToCloudinary = require("../middleware/cloudinary.middleware");
const verifyToken = require("../middleware/verifyToken.middleware");

const router = express.Router()

router.post("/create-group",verifyToken, upload.single("group_icon"),uploadToCloudinary, createGroup)
router.get("/get-group/:groupId",verifyToken, getGroup)

module.exports = router;