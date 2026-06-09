const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    console.log("=== UPLOAD TO CLOUDINARY CALLED ===");

    const path = req.file.path;
    console.log("File path:", path);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chatingApp",
    });

    console.log("result", result);
    req.public_id = result.public_id;
    req.imageUrl = result.secure_url;
    next();
  } catch (error) {
    console.log("uploadToCloudinary", error.message);
    res.status(500).json({ message: "cloudinary error" });
  }
};

module.exports = uploadToCloudinary;
