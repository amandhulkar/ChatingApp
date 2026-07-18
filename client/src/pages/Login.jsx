import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api/config"
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    // console.log(e.target.name , e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await axios.post(`${API_BASE_URL}/api/login`, formData);
      console.log(res.data);
      const token = res.data.token;
      localStorage.setItem("token", token); //tokan ko local storage me store krna
      window.dispatchEvent(new Event("authTokenChanged"));
      // taki user ko baar baar login na krna pade
      console.log("Saved Token:", token); // token ko console me print krna taaki hum verify kr sake ki token sahi se store hua hai ya nahi
      toast.success(res.data.message);
      setFormData({ email: "", password: "" });
      navigate("/chat"); // login hone ke baad user ko chat page pe le jana
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen w-full bg-[#f0f2f5] overflow-hidden flex flex-col">
      {/* Top Header */}

      <div className="w-full h-32 bg-primary flex flex-col justify-center items-center py-6 text-white">
        <h1 className="text-4xl font-bold">Welcome Back</h1>

        <p className="text-gray-200 mt-2">Login to continue</p>
      </div>

      {/* Center Form */}

      <div className="flex-1 flex justify-center items-center">
        {/* Form Card */}

        <div className="bg-white w-130 p-10 shadow-md rounded-md">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:border-[#012f2b] outline-none"
              />
            </div>

            {/* Password */}

            <div>
              <label className="text-gray-500 font-semibold text-sm">
                PASSWORD
              </label>

              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 pr-12 focus:border-[#012f2b] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-3 rounded-full text-lg font-semibold hover:bg-[#02443d] transition flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Bottom Text */}

          <p className="text-center mt-6 text-gray-600 text-sm">
            Don’t have an account?
            {/* <a href="/signup" className="text-primary font-semibold ml-2">
              Sign Up
            </a> */}
            <Link to={"/signup"} className="font-medium text-primary" >Sign up</Link>
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

export default Login;