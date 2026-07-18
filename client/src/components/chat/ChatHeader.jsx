import { IoArrowBackCircleOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext"
import axios from "axios";
import { API_BASE_URL } from "../../api/config";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

const DEFAULT_ABOUT = "Hey there! I am using ChatingApp.";

const ChatHeader = ({ searchText, setSearchText, onClearChat, onDeleteChat, onBlockUser, onUnblockUser, blockedByMe, onRelationshipChange }) => {
  const [selectedUser ,setSelectedUser] = useState()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
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
      onRelationshipChange?.(res.data.relationship)
    } catch (error) {
      console.log(error.response);

    }
  }
  useEffect(() => {
    fetchUser()
  }, [userId, token])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

      <div className="min-w-0 flex-1">
        <p className="text-white font-medium text-sm truncate">{selectedUser?.fullName}</p>
        <p className="text-xs text-green-300">
          {onlineUsers.includes(userId)?"🟢 Online" :" ⚫ Offline"}

        </p>
        <p className="text-xs text-white/70 truncate max-w-55">
          {selectedUser?.about || DEFAULT_ABOUT}
        </p>
      </div>

      <div ref={menuRef} className="relative ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 bg-white/15 dark:bg-[#111b21] border border-white/20 dark:border-[#2a3942] rounded-full px-3 py-1.5 text-white">
          <IoSearchOutline className="text-lg text-white/80 dark:text-[#8696a0]" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search chat"
            className="w-32 md:w-44 bg-transparent outline-none text-sm text-white dark:text-[#e9edef] placeholder:text-white/70 dark:placeholder:text-[#8696a0]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/15 dark:hover:bg-[#2a3942] transition"
        >
          <BsThreeDotsVertical />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-11 w-44 bg-white dark:bg-[#233138] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a3942] overflow-hidden z-20">
            <div className="sm:hidden px-3 py-2 border-b border-gray-100 dark:border-[#2a3942]">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search chat"
                className="w-full bg-gray-100 dark:bg-[#111b21] rounded-lg px-3 py-2 outline-none text-sm text-gray-900 dark:text-[#e9edef] placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
              />
            </div>
            <button type="button" onClick={() => { blockedByMe ? onUnblockUser() : onBlockUser(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-100 dark:hover:bg-[#2a3942]">
              {blockedByMe ? "Unblock" : "Block"}
            </button>
            <button type="button" onClick={() => { onClearChat(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-100 dark:hover:bg-[#2a3942]">
              Clear Chat
            </button>
            <button type="button" onClick={() => { onDeleteChat(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#2a3942]">
              Delete Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;