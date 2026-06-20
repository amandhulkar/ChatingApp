import axios from "axios";
import React from "react";
import { API_BASE_URL } from "../../api/config";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";
import { useRef } from "react";

const MessageArea = ({ messages, setMessages }) => {
  const { userId } = useParams();
  const { token, socketConnected, socketRef } = useSocket();
  const loginUser = JSON.parse(localStorage.getItem("user"))
  const bottomRef = useRef()

  const fetchMessages = async () => {
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
  }, [userId]);

  useEffect(() => {
    if (!socketRef?.current) return;

    const handleMessage = (msg) => {
      console.log("socket message", msg);
      setMessages((prev) => [...prev, msg]);
    };
    socketRef?.current.on("newMessage", handleMessage);
    return () => {
      socketRef?.current.off("newMessage");
    };
  }, [socketConnected]);

  useEffect(() => {
    bottomRef.current.scrollIntoView({
      behavior: "smooth"
    })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((msg) => {
        const isMe = msg.senderId === loginUser?._id
        return (
          <>
            <div key={msg._id} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`} >
              <div className={` p-2 rounded-lg shadow  max-w-[70%]
                 ${isMe ? "bg-[#DCF9c6] " : "bg-white"}   `}>

                {/* text  */}
                {msg.text && <p className="text-sm">{msg.text}</p>}

                {/* image  */}
                {msg.imageUrl?.length > 0 &&
                  msg.imageUrl.map((img, index) => {
                    return (
                      <img
                        key={index}
                        src={img}
                        alt="image"
                        className="rounded-lg max-w-[250px]"
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
                        className="rounded-lg max-w-[250px]"
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
                        className="rounded-lg max-w-[250px]"
                      />
                    );
                  })}

              </div>
            </div>
          </>
        );
      })}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default MessageArea;
