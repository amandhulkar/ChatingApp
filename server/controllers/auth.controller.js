const User = require("../models/User");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        message: "User already exist",
      });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      message: "User Signup Successfully",

      data: newUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const payload = {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    res.status(200).json({
      message: "Login Successfully",

      token,

      data: {
        _id: user._id,

        fullName: user.fullName,

        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const getUser = await User.findById(userId).select("-password");
    res.status(200).json({
      message: "This is Profile page  , You can see your Profile data",
      user: getUser,
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log("=== UPDATE PROFILE CALLED ===");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    console.log("IMAGE URL:", req.imageUrl);

    const userId = req.user._id;
    // const { fullName, email } = req.body;

    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { fullName, email },
    //   { new: true },
    // ).select("-password");
    const updateData = {};

    if (req.body.fullName) {
      updateData.fullName = req.body.fullName;
    }
    if (req.body.email) {
      updateData.email = req.body.email;
    }
    if (req.body.about !== undefined) {
      const about = req.body.about.trim();
      if (about.length > 140) {
        return res.status(400).json({ message: "About must be 140 characters or less" });
      }
      updateData.about = about;
    }
    if (req.imageUrl?.length) {
      updateData.profilePic = req.imageUrl[0];
    }
    const updateUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// const getAllContacts = async (req, res) => {
//   try {
//     const loginUserId = req.user._id;
//     // console.log(loginUserId);
//     // const query = await User.find({ _id: { $ne: loginUserId } }).select("-password",);

//     const user = await User.find();
//     // const user = await User.find(query);

//     res.status(200).json({
//       message: "get all contacts list",
//       // contacts: query,
//       data: user,
//     });
//   } catch (error) {
//     // console.log(error);

//     res.status(500).json({ message: error.message });
//   }
// };
const getAllContacts = async (req, res) => {
  try {
    const logingUserId = req.user._id;
    const query = { _id: { $ne: logingUserId } };
    const user = await User.find(query).select("-password").lean();

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: logingUserId,
          seen: false,
          deletedFor: { $ne: logingUserId },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const contacts = user.map((contact) => ({
      ...contact,
      unreadCount: unreadMap[contact._id.toString()] || 0,
    }));

    res.status(200).json({
      message: "get all contacts list",
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const imageupload = async (req, res) => {
  try {
    console.log(req.file);

    res.status(200).json({
      message: "image upload",
      file: req.file,
      image: req.imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getAllContacts,
  updateProfile,
  imageupload,
};
