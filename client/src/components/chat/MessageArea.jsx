import axios from "axios";
import React from "react";
import { MdDeleteOutline } from "react-icons/md";
import { API_BASE_URL } from "../../api/config";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";
import { useRef } from "react";

const MessageArea = ({ messages, setMessages, searchText = "", onDeleteMessage }) => {
  const { userId } = useParams();
  const { token, socketConnected, socketRef } = useSocket();
  const bottomRef = useRef()

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const formatDateLabel = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) => a.toDateString() === b.toDateString();
    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

    if (isSameDay(msgDate, today)) return "Today";
    if (isSameDay(msgDate, yesterday)) return "Yesterday";
    if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: "long" });
    return msgDate.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  }

  const getId = (value) => value?._id || value;

  const filteredMessages = searchText.trim()
    ? messages.filter((msg) => msg.text?.toLowerCase().includes(searchText.trim().toLowerCase()))
    : messages;

  const isCurrentChatMessage = (msg) => {
    const senderId = getId(msg.senderId);
    const receiverId = getId(msg.receiverId);
    return senderId === userId || receiverId === userId;
  }

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-message/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data.data);
      setMessages(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, [userId, token]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleMessage = (msg) => {
      console.log("socket message", msg);
      if (!isCurrentChatMessage(msg)) return;

      setMessages((prev) => {
        if (prev.some((item) => item._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("newMessage", handleMessage);
    return () => {
      socket.off("newMessage", handleMessage);
    };
  }, [socketConnected, socketRef, setMessages, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a] px-2 sm:px-4 py-3">
      {filteredMessages.length === 0 && searchText.trim() ? (
        <div className="flex justify-center mt-6">
          <span className="bg-white/80 dark:bg-[#182229] text-gray-600 dark:text-[#8696a0] text-sm px-4 py-2 rounded-lg shadow-sm">
            No messages found
          </span>
        </div>
      ) : null}
      {filteredMessages.map((msg, index) => {
        const isMe = getId(msg.senderId) !== userId
        const previousMsg = filteredMessages[index - 1];
        const showDate = !previousMsg || new Date(previousMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

        return (
          <React.Fragment key={msg._id}>
            {showDate && (
              <div className="flex justify-center my-3">
                <span className="bg-white/80 dark:bg-[#182229] text-gray-600 dark:text-[#8696a0] text-xs px-3 py-1 rounded-lg shadow-sm">
                  {formatDateLabel(msg.createdAt)}
                </span>
              </div>
            )}

            <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`} >
              <div className={`p-2 rounded-lg shadow max-w-[85%] sm:max-w-[75%] break-words text-gray-900 dark:text-[#e9edef]
                ${isMe ? "bg-[#dcf8c6] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none"}`}>

                {/* text  */}
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                {/* image  */}
                {msg.imageUrl?.length > 0 &&
                  msg.imageUrl.map((img, index) => {
                    return (
                      <img
                        key={index}
                        src={img}
                        alt="image"
                        className="rounded-lg max-w-full sm:max-w-[250px]"
                      />
                    );
                  })}

                {/* video  */}
                {msg.videoUrl?.length > 0 &&
                  msg.videoUrl.map((video, index) => {
                    return (
                      <video
                        key={index}
                        src={video}
                        alt="video"
                        controls
                        className="rounded-lg max-w-full sm:max-w-[250px]"
                      />
                    );
                  })}

                {/* video  */}
                {msg.audioUrl?.length > 0 &&
                  msg.audioUrl.map((audio, i) => {
                    return (
                      <audio
                        key={i}
                        src={audio}
                        alt="audio"
                        controls
                        className="rounded-lg max-w-full sm:max-w-[250px]"
                      />
                    );
                  })}

                <div className={`flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-[#8696a0] ${isMe ? "justify-end" : "justify-start"}`}>
                  <button
                    type="button"
                    onClick={() => onDeleteMessage?.(msg._id)}
                    className="mr-1 rounded-full p-1 text-gray-400 hover:bg-black/10 hover:text-red-500 dark:hover:bg-white/10"
                    title="Delete message"
                  >
                    <MdDeleteOutline className="text-sm" />
                  </button>
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMe && <span className={msg.seen ? "text-blue-500 dark:text-[#53bdeb]" : "text-gray-400 dark:text-[#8696a0]"}>✓✓</span>}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default MessageArea;
