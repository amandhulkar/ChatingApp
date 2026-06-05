const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    fullName: {
        type: String
    },

    email: {
        type: String,
        unique: true
    },

    password: {
        type: String,
        minlength: 6
    },
    profilePic:{
        type: String,
        default: ""
    }

})

const User = mongoose.model("user", userSchema)

module.exports = User