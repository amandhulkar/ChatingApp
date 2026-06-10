const express = require("express");
const { signup, login, getProfile , getAllContacts , updateProfile , imageupload } = require("../controllers/auth.controller");
const upload = require("../middleware/multer.middleware");
const uploadToCloudinary = require("../middleware/cloudinary.middleware");
const verifyToken = require("../middleware/verifyToken.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/getProfile" ,verifyToken,  getProfile)
router.get("/getAllContacts" ,verifyToken,  getAllContacts)
router.put("/updateProfile" ,verifyToken, upload.single("profileImage"),uploadToCloudinary, updateProfile)
router.post("/imageupload" ,upload.single("file") ,uploadToCloudinary ,imageupload )

module.exports = router;
