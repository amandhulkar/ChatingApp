// import React from "react";
// import ChatHeader from "../components/chat/ChatHeader";
// import MessageArea from "../components/chat/MessageArea";
// import InputBar from "../components/chat/InputBar";
// import { useParams } from "react-router-dom";

// const Chat = () => {
//   const { userId } = useParams();
//   console.log(userId);

//   return (
//     <>
//       <div className="flex flex-col h-screen">
//         <ChatHeader />
//         <MessageArea />
//         <InputBar />
//       </div>
//     </>
//   );
// };

// export default Chat;


import axios from 'axios'
import toast from 'react-hot-toast'
import ChatHeader from '../components/chat/ChatHeader'
import MessageArea from '../components/chat/MessageArea'
import InputBar from '../components/chat/InputBar'
import { API_BASE_URL } from '../api/config'
import { useSocket } from '../context/SocketContext'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [searchText, setSearchText] = useState("")
  const [blockedByMe, setBlockedByMe] = useState(false)
  const [hasBlockedMe, setHasBlockedMe] = useState(false)
  const { token } = useSocket()
  const { userId } = useParams()
  const navigate = useNavigate()

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const showConfirmToast = ({ title, message, confirmText, confirmClass = "bg-primary", onConfirm }) => {
    toast((t) => (
      <div className="w-72">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id)
              onConfirm()
            }}
            className={`rounded-full px-3 py-1.5 text-sm text-white ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ), { duration: 6000 })
  }

  const handleError = (error) => {
    toast.error(error.response?.data?.message || "Something went wrong")
  }

  const handleRelationshipChange = (relationship) => {
    setBlockedByMe(relationship?.blockedByMe || false)
    setHasBlockedMe(relationship?.hasBlockedMe || false)
  }

  const handleClearChat = () => {
    showConfirmToast({
      title: "Clear chat?",
      message: "Messages will be cleared only for you.",
      confirmText: "Clear",
      onConfirm: async () => {
        try {
          await axios.patch(`${API_BASE_URL}/api/chats/${userId}/clear`, {}, authHeader)
          setMessages([])
          toast.success("Chat cleared")
        } catch (error) {
          handleError(error)
        }
      },
    })
  }

  const handleDeleteChat = () => {
    showConfirmToast({
      title: "Delete chat?",
      message: "This chat will be deleted only for you.",
      confirmText: "Delete",
      confirmClass: "bg-red-500",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/chats/${userId}`, authHeader)
          setMessages([])
          toast.success("Chat deleted")
          navigate("/chat")
        } catch (error) {
          handleError(error)
        }
      },
    })
  }

  const handleBlockUser = () => {
    showConfirmToast({
      title: "Block user?",
      message: "This user will not be able to send you messages.",
      confirmText: "Block",
      confirmClass: "bg-red-500",
      onConfirm: async () => {
        try {
          await axios.patch(`${API_BASE_URL}/api/users/${userId}/block`, {}, authHeader)
          setBlockedByMe(true)
          toast.success("User blocked")
        } catch (error) {
          handleError(error)
        }
      },
    })
  }

  const handleUnblockUser = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${userId}/unblock`, {}, authHeader)
      setBlockedByMe(false)
      toast.success("User unblocked")
    } catch (error) {
      handleError(error)
    }
  }

  const handleDeleteMessage = (messageId) => {
    showConfirmToast({
      title: "Delete message?",
      message: "This message will be removed only for you.",
      confirmText: "Delete",
      confirmClass: "bg-red-500",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/messages/${messageId}`, authHeader)
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
          toast.success("Message deleted")
        } catch (error) {
          handleError(error)
        }
      },
    })
  }

  return (
    <>
      <div className='flex flex-col h-screen min-w-0 overflow-hidden'>
        <ChatHeader
          searchText={searchText}
          setSearchText={setSearchText}
          onClearChat={handleClearChat}
          onDeleteChat={handleDeleteChat}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          blockedByMe={blockedByMe}
          onRelationshipChange={handleRelationshipChange}
        />
        <MessageArea setMessages={setMessages} messages={messages} searchText={searchText} onDeleteMessage={handleDeleteMessage} />
        {blockedByMe ? (
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-[#2a3942] px-4 py-4 text-center">
            <p className="text-sm text-gray-700 dark:text-[#e9edef]">You blocked this user</p>
            <button
              type="button"
              onClick={handleUnblockUser}
              className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Unblock
            </button>
          </div>
        ) : hasBlockedMe ? (
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-[#2a3942] px-4 py-4 text-center">
            <p className="text-sm text-gray-700 dark:text-[#e9edef]">You can't send messages to this user</p>
          </div>
        ) : (
          <InputBar setMessages={setMessages} />
        )}
      </div>
    </>
  )
}

export default Chat
