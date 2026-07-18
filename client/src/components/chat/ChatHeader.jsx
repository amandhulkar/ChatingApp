import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext"
import axios from "axios";
import { API_BASE_URL } from "../../api/config";
import { useEffect } from "react";
import { useState } from "react";

const DEFAULT_ABOUT = "Hey there! I am using ChatingApp.";

const ChatHeader = () => {
  const [selectedUser ,setSelectedUser] = useState()
  const { token, onlineUsers } = useSocket()
  const navigate = useNavigate();
  const { userId } = useParams()
  // console.log(onlineUsers);
  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(res.data.data);
      setSelectedUser(res.data.data)
    } catch (error) {
      console.log(error.response);

    }
  }
  useEffect(() => {
    fetchUser()
  }, [userId, token])
  return (
    <div className="px-4 py-3 bg-[#075E54] dark:bg-[#202c33] flex items-center gap-3">
      <button
        onClick={() => navigate("/chat")}
        className="md:hidden text-white text-2xl mr-1 p-2 -m-2"
      >
        <IoArrowBackCircleOutline />
      </button>

      <div
        className="w-9 h-9 rounded-full bg-white dark:bg-[#2a3942] text-[#272626] dark:text-[#e9edef] flex items-center justify-center font-medium text-lg overflow-hidden cursor-pointer"
      >
        {
          selectedUser?.profilePic?(
            <img src={selectedUser?.profilePic} className="w-full h-full object-cover rounded-full" />
          ):(
            <span >
              {selectedUser?.fullName?.charAt(0)?.toUpperCase()}
            </span>
          )
        }
      </div>

      <div className="min-w-0">
        <p className="text-white font-medium text-sm truncate">{selectedUser?.fullName}</p>
        <p className="text-xs text-green-300">
          {onlineUsers.includes(userId)?"🟢 Online" :" ⚫ Offline"}

        </p>
        <p className="text-xs text-white/70 truncate max-w-55">
          {selectedUser?.about || DEFAULT_ABOUT}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;