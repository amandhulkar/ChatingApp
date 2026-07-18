import React, { useEffect, useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import toast from "react-hot-toast";

const DEFAULT_ABOUT = "Hey there! I am using ChatingApp.";

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profilePic: "",
    about: DEFAULT_ABOUT,
  });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      const res = await axios.get(`${API_BASE_URL}/api/getProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);
      setFormData({ ...res.data.user, about: res.data.user?.about || DEFAULT_ABOUT });
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-15 h-15 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);

      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("about", formData.about || "");

      if (selectedImage) {
        data.append("profileImage", selectedImage);
      }

      const res = await axios.put(`${API_BASE_URL}/api/updateProfile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(res.data);
      if (res.data.user) {
        setFormData({ ...res.data.user, about: res.data.user.about || DEFAULT_ABOUT });
      }
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.log(error.response.API_BASE_URL);
      toast.error("Profile Update Failed");
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  // useEffect(() => {
  //   fetchProfile();
  // }, []);
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="w-15 h-15 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
  //     </div>
  //   );
  // }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authTokenChanged"));
    navigate("/login");
  };

  return (
    // <div className="flex flex-col h-full bg-gray-100">
    <div className="flex flex-col h-screen bg-gray-100 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/chat")}
          className="md:hidden text-white text-[28px] cursor-pointer hover:text-gray-200 transition "
        >
          <IoArrowBackCircleOutline />
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-primary pb-8 pt-4 flex flex-col items-center">
        <label className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center cursor-pointer overflow-hidden mb-3">
          {/* {formData.profilePic ? (
            <img
              src={formData.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            // <span className="text-white text-3xl font-medium">A</span>
            <span className="text-white text-3xl font-medium">
              {formData.fullName?.charAt(0).toUpperCase()}
            </span>
          )} */}
          {selectedImage || formData.profilePic ? (
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : formData.profilePic
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-3xl font-medium">
              {formData.fullName?.charAt(0).toUpperCase()}
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              console.log("Selected File:", e.target.files[0]);
              setSelectedImage(e.target.files[0]);
            }}
          />
        </label>

        <p className="text-white font-medium">{formData.fullName}</p>
        <p className="text-white/70 text-sm">{formData.email}</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 overflow-auto px-4 py-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#00BFA5] font-medium uppercase tracking-wide mb-3">
            Account Info
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={handleChange}
                // readOnly
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="Enter Email"
                value={formData.email}
                // onChange={(e) =>
                //   setFormData({ ...formData, email: e.target.value })
                // }
                // readOnly
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">About</label>
                <span className="text-[11px] text-gray-400">
                  {(formData.about || "").length}/140
                </span>
              </div>
              <textarea
                name="about"
                value={formData.about || ""}
                onChange={handleChange}
                placeholder="Write something about yourself"
                maxLength={140}
                rows="3"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Update Button */}
        {/* <button
          onClick={handleUpdateProfile}
          className="bg-primary text-white rounded-full py-3 text-sm font-medium cursor-pointer hover:opacity-90 transition"
        >
          Update Profile
        </button> */}

        <button
          onClick={handleUpdateProfile}
          disabled={updateLoading}
          className="bg-primary text-white rounded-full py-3 text-sm font-medium cursor-pointer hover:opacity-90 transition"
        >
          {updateLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            "Update Profile"
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white rounded-full py-3 text-sm font-medium cursor-pointer hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
