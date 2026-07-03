import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { API_BASE_URL } from "../api/config";
import { useSocket } from "../context/SocketContext";

const Group = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { token, socketRef, socketConnected } = useSocket();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fileUrl, setFileUrl] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef();
  const fileInputRef = useRef();
  const messageInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const emojis = ["😀", "😂", "😍", "🥰", "😎", "😭", "😡", "👍", "🙏", "🔥", "❤️", "🎉", "🤣", "😘", "😋", "😢", "🤔", "👌", "💯", "✨"];

  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

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

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-group-messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchGroup();
    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    socket.emit("joinGroup", groupId);

    const handleGroupMessage = (msg) => {
      if (getId(msg.groupId) !== groupId) return;
      setMessages((prev) => {
        if (prev.some((item) => item._id === msg._id)) return prev;
        return [...prev, msg];
      });
    }

    socket.on("newGroupMessage", handleGroupMessage);

    return () => {
      socket.emit("leaveGroup", groupId);
      socket.off("newGroupMessage", handleGroupMessage);
    }
  }, [socketConnected, socketRef, groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addFiles = (files) => {
    if (!files?.length) return;

    const attachments = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFileUrl((prev) => [...prev, ...attachments]);
  }

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  }

  const handleRemoveFile = (index) => {
    setFileUrl((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    messageInputRef.current?.focus();
  }

  const handleSend = async () => {
    if (sending || (!text.trim() && fileUrl.length === 0)) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      fileUrl.forEach(({ file }) => {
        formData.append("files", file);
      });

      const res = await axios.post(`${API_BASE_URL}/api/send-group-message/${groupId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prev) => {
        if (prev.some((item) => item._id === res.data.data._id)) return prev;
        return [...prev, res.data.data];
      });
      setText("");
      fileUrl.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      setFileUrl([]);
    } catch (error) {
      console.log(error.response);
    } finally {
      setSending(false);
    }
  }

  const startRecording = async () => {
    if (recording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        addFiles([audioFile]);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.log("Microphone permission error", error);
    }
  }

  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setRecording(false);
  }

  return (
    <div className="flex flex-col h-screen min-w-0 overflow-hidden">
      <div className="px-4 py-3 bg-[#075E54] flex items-center gap-3 text-white">
        <button type="button" onClick={() => navigate("/chat")} className="md:hidden text-2xl">
          <IoArrowBack />
        </button>
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
          {group?.group_icon ? (
            <img src={group.group_icon} alt={group.group_name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-semibold">{(group?.group_name || "G").charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{group?.group_name || "Group"}</p>
          <p className="text-xs text-white/80 truncate">
            {group?.group_member?.length
              ? group.group_member.map((member) => member.fullName).join(", ")
              : "0 members"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#efeae2] px-2 sm:px-4 py-3">
        {messages.map((msg, index) => {
          const isMe = getId(msg.senderId) === currentUserId;
          const previousMsg = messages[index - 1];
          const showDate = !previousMsg || new Date(previousMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

          return (
            <div key={msg._id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="bg-white/80 text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm">
                    {formatDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}

              <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`p-2 rounded-lg shadow max-w-[85%] sm:max-w-[75%] break-words ${isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                  {!isMe && <p className="text-[11px] font-semibold text-primary mb-1">{msg.senderId?.fullName || "Member"}</p>}

                  {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                  {msg.imageUrl?.length > 0 && msg.imageUrl.map((img, i) => (
                    <img key={i} src={img} alt="image" className="rounded-lg max-w-full sm:max-w-[250px] mt-1" />
                  ))}

                  {msg.videoUrl?.length > 0 && msg.videoUrl.map((video, i) => (
                    <video key={i} src={video} controls className="rounded-lg max-w-full sm:max-w-[250px] mt-1" />
                  ))}

                  {msg.audioUrl?.length > 0 && msg.audioUrl.map((audio, i) => (
                    <audio key={i} src={audio} controls className="rounded-lg max-w-full sm:max-w-[250px] mt-1" />
                  ))}

                  <div className={`flex items-center gap-1 mt-1 text-[11px] text-gray-500 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="relative bg-[#F0F0F0] px-2 sm:px-3 py-3 sm:py-4 flex items-end gap-1 sm:gap-2 border-t border-gray-200">
        {showEmoji && (
          <div className="absolute bottom-full left-3 mb-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 grid grid-cols-5 gap-2 z-10">
            {emojis.map((emoji) => (
              <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:bg-gray-100 rounded-lg p-1">
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button type="button" onClick={() => setShowEmoji((prev) => !prev)} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200 ${showEmoji ? "bg-gray-200" : ""}`}>
          <BsEmojiSmile className="text-xl text-gray-600" />
        </button>

        <button type="button" onClick={() => fileInputRef.current.click()} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200">
          <GrGallery className="text-xl text-gray-600" />
        </button>

        <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*,audio/*" onChange={handleFileChange} />

        <div className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
            {fileUrl.map(({ file, previewUrl }, i) => (
              <div className="relative bg-white rounded-2xl p-1 shadow-sm" key={`${file.name}-${i}`}>
                {file.type.startsWith("image") && <img src={previewUrl} alt={file.name} className="w-24 h-24 rounded-xl object-cover" />}
                {file.type.startsWith("video") && <video src={previewUrl} controls className="w-24 h-24 rounded-xl object-cover" />}
                {file.type.startsWith("audio") && (
                  <div className="w-44 sm:w-56 p-2">
                    <p className="text-xs text-gray-600 mb-1 truncate">{file.name}</p>
                    <audio src={previewUrl} controls className="w-full" />
                  </div>
                )}
                <button type="button" onClick={() => handleRemoveFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex justify-center items-center text-xs">
                  X
                </button>
              </div>
            ))}
          </div>

          <input
            ref={messageInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) handleSend();
            }}
            className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 outline-none text-sm"
          />
        </div>

        <button type="button" onClick={recording ? stopRecording : startRecording} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-gray-200"}`}>
          {recording ? <FaStop className="text-white" /> : <FaMicrophone className="text-gray-600" />}
        </button>

        <button onClick={handleSend} disabled={sending} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full ${sending ? "bg-gray-400" : "bg-primary"}`}>
          <IoSend className="text-white" />
        </button>
      </div>
    </div>
  )
}

export default Group
