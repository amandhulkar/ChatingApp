const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async(req ,res,next)=>{
    try {
        if(!req.file){
           return next()
        }
        const result = await cloudinary.uploader.upload(req.file.path,{
           folder:"chatingApp" 
        })
        // console.log("result",result);
        // req.public_id = result.public_id;
        req.imageUrl = result.secure_url
        next()
    } catch (error) {
        console.log("uploadToCloudinary", error.message);
        res.status(500).json({message:"cloudinary error"})
    }
}
module.exports = uploadToCloudinary
    