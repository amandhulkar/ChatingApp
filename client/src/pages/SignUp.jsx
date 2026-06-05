import React, { useState } from "react";
import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
// import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { useNavigate , Link} from "react-router-dom";


const SignUp = () => {
  // const [FullName, setFullName] = useState("");
  // const [Email, setEmail] = useState("");
  // const [Password, setPassword] = useState("");

  // const handleChange1 = (e) => {
  //   // e.preventDefault();
  //   console.log( e.target.name , e.target.value);
  // };

  // const handleChange2 = (e) => {
  //   console.log(e.target.name , e.target.value);
  // };

  // const handleChange3 = (e) => {
  //   console.log(e.target.name , e.target.value);
  // };                                                    // bada ho jeaga dono same hi kaam krte h
  //                                                      // to ek hi function bana ke dono me use kr skte h

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()


  const handleChange = (e) => {
    // console.log(e.target.name, e.target.value);

    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };
  // console.log(formData);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
     if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    console.log("Form submitted:", formData);
    // console.log("Hello");
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await axios.post(`${API_BASE_URL}/api/signup`, formData);

      // console.log(res.data);

      toast.success(res.data.message);

      setFormData({
        fullName: "",
        email: "",
        password: "",
      });
      navigate("/login"); // signup hone ke baad user ko login page pe le jana
    } catch (error) {
      setLoading(false);
      console.log(error.response?.data?.message || error.message);

      toast.error(error.response?.data?.message || "signup failed. please try again");
    } finally {
      setLoading(false);
    }
  }; // Handle form submission logic here

  return (
    <div className="h-screen w-full bg-[#f0f2f5] overflow-hidden flex flex-col">
      {/* Top Header */}

      <div className="w-full h-32 bg-primary flex flex-col justify-center items-center py-6 text-white">
        <h1 className="text-4xl font-bold">Create Account</h1>

        <p className="text-gray-200 mt-2">Join WhatsApp today</p>
      </div>

      {/* Center Form */}

      <div className="flex-1 flex justify-center items-center">
        {/* Form Card */}

        <div className="bg-white w-130 p-10 shadow-md rounded-md">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* Full Name */}

            <div>
              <label className="text-gray-500 font-semibold text-sm">
                FULL NAME
              </label>

              <input
                type="text"
                placeholder="Your Name"
                name="fullName"
                value={formData.fullName}
                // onChange={(e) => setFullName(e.target.value)}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#012f2b] outline-none"
              />
            </div>

            {/* Email */}

            <div>
              <label className="text-gray-500 font-semibold text-sm">
                EMAIL
              </label>

              <input
                type="email"
                placeholder="Your@email.com"
                name="email"
                value={formData.email}
                // onChange={(e) => setEmail(e.target.value)}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#012f2b] outline-none"
              />
            </div>

            {/* Password */}

            <div>
              <label className="text-gray-500 font-semibold text-sm">
                PASSWORD
              </label>

              <input
                type="password"
                placeholder="********"
                name="password"
                value={formData.password}
                // onChange={(e) => setPassword(e.target.value)}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#012f2b] outline-none"
              />
            </div>

            {/* Create Account Button */}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-3 rounded-full text-lg font-semibold hover:bg-[#02443d] transition flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Bottom Text */}

          {/* <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account?
            <span className="text-[#0b6b5c] font-semibold cursor-pointer ml-2">
              Sign in
            </span>
          </p> */}

          <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account?
            <a href="/login" className="text-primary font-semibold ml-2">
              Sign in
            </a>
          </p>

          {/* Google Button */}

          <button className="w-full border border-gray-300 py-3 rounded-full mt-5 text-base font-semibold flex justify-center items-center gap-3 hover:bg-gray-100 transition">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
              alt="google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
