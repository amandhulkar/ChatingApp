const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    req.imageUrl = [];
    req.videoUrl = [];
    req.audioUrl = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "chatingApp",
      });

      if (result.resource_type === "image") {
        req.imageUrl.push(result.secure_url);
      } else if (result.resource_type === "video") {
        req.videoUrl.push(result.secure_url);
      } else {
        req.audioUrl.push(result.secure_url);
      }
    }

    next();
  } catch (error) {
    console.log("uploadToCloudinary:", error.message);
    res.status(500).json({ message: "Cloudinary upload error" });
  }
};

module.exports = uploadToCloudinary;