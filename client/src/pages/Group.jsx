import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { BsEmojiSmile, BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md";
import { IoArrowBack, IoSearchOutline, IoSend } from "react-icons/io5";
import { API_BASE_URL } from "../api/config";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

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
  const [openDeleteMenu, setOpenDeleteMenu] = useState(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");
  const [editGroupIcon, setEditGroupIcon] = useState(null);
  const [editGroupIconPreview, setEditGroupIconPreview] = useState("");
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedAddMembers, setSelectedAddMembers] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const bottomRef = useRef();
  const fileInputRef = useRef();
  const editIconInputRef = useRef();
  const messageInputRef = useRef();
  const headerMenuRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const emojis = ["😀", "😂", "😍", "🥰", "😎", "😭", "😡", "👍", "🙏", "🔥", "❤️", "🎉", "🤣", "😘", "😋", "😢", "🤔", "👌", "💯", "✨"];

  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
  const isGroupAdmin = group?.group_admin?.some((admin) => (admin?._id || admin) === currentUserId);
  const groupMemberIds = group?.group_member?.map((member) => member._id) || [];
  const availableContacts = contacts.filter((contact) => !groupMemberIds.includes(contact._id));
  const twoHours = 2 * 60 * 60 * 1000;

  const canDeleteForEveryone = (msg) => {
    return getId(msg.senderId) === currentUserId && !msg.deletedForEveryone && Date.now() - new Date(msg.createdAt).getTime() <= twoHours;
  }

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

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getAllContacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchGroup();
    fetchMessages();
    fetchContacts();
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

    const handleDeletedForEveryone = (payload) => {
      if (payload.chatType !== "group" || getId(payload.groupId) !== groupId) return;
      setMessages((prev) => prev.map((item) => item._id === payload.message._id ? payload.message : item));
    }

    socket.on("newGroupMessage", handleGroupMessage);
    socket.on("messageDeletedForEveryone", handleDeletedForEveryone);

    return () => {
      socket.emit("leaveGroup", groupId);
      socket.off("newGroupMessage", handleGroupMessage);
      socket.off("messageDeletedForEveryone", handleDeletedForEveryone);
    }
  }, [socketConnected, socketRef, groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!group) return;
    setEditGroupName(group.group_name || "");
    setEditGroupDescription(group.des || "");
    setSelectedAddMembers([]);
  }, [group]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setShowHeaderMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const showConfirmToast = ({ title, message, onConfirm }) => {
    toast((t) => (
      <div className="w-72">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={() => toast.dismiss(t.id)} className="rounded-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button type="button" onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="rounded-full bg-red-500 px-3 py-1.5 text-sm text-white">
            Delete
          </button>
        </div>
      </div>
    ), { duration: 6000 })
  }

  const handleExitGroup = () => {
    showConfirmToast({
      title: "Exit group?",
      message: "You will stop receiving messages from this group.",
      onConfirm: async () => {
        try {
          await axios.patch(`${API_BASE_URL}/api/groups/${groupId}/exit`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Exited group");
          navigate("/chat");
        } catch (error) {
          toast.error(error.response?.data?.message || "Exit group failed");
        }
      }
    })
  }

  const handleEditIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editGroupIconPreview) URL.revokeObjectURL(editGroupIconPreview);
    setEditGroupIcon(file);
    setEditGroupIconPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim() || updatingGroup) return;

    setUpdatingGroup(true);
    try {
      const formData = new FormData();
      formData.append("group_name", editGroupName.trim());
      formData.append("des", editGroupDescription.trim());
      if (editGroupIcon) formData.append("group_icon", editGroupIcon);

      const res = await axios.put(`${API_BASE_URL}/api/update-group/${groupId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroup(res.data.data);
      if (editGroupIconPreview) URL.revokeObjectURL(editGroupIconPreview);
      setEditGroupIcon(null);
      setEditGroupIconPreview("");
      toast.success("Group updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Group update failed");
    } finally {
      setUpdatingGroup(false);
    }
  }

  const toggleAddMember = (memberId) => {
    setSelectedAddMembers((prev) => {
      if (prev.includes(memberId)) return prev.filter((id) => id !== memberId);
      return [...prev, memberId];
    });
  }

  const handleAddMembers = async () => {
    if (selectedAddMembers.length === 0 || addingMembers) return;

    setAddingMembers(true);
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        members: selectedAddMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroup(res.data.data);
      setSelectedAddMembers([]);
      toast.success("Members added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Add members failed");
    } finally {
      setAddingMembers(false);
    }
  }

  const handleDeleteMessage = (messageId, scope) => {
    const isEveryone = scope === "everyone";

    showConfirmToast({
      title: isEveryone ? "Delete for everyone?" : "Delete for me?",
      message: isEveryone ? "This message will be deleted for everyone." : "This message will be removed only for you.",
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API_BASE_URL}/api/messages/${messageId}?scope=${scope}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (isEveryone) {
            setMessages((prev) => prev.map((msg) => msg._id === messageId ? res.data.data : msg));
          } else {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
          }
          toast.success(isEveryone ? "Message deleted for everyone" : "Message deleted for you");
        } catch (error) {
          toast.error(error.response?.data?.message || "Message delete failed");
        }
      }
    })
  }

  return (
    <div className="flex flex-col h-screen min-w-0 overflow-hidden bg-white text-gray-900 dark:bg-[#111b21] dark:text-[#e9edef]">
      <div className="px-4 py-3 bg-[#075E54] dark:bg-[#202c33] flex items-center gap-3 text-white">
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
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{group?.group_name || "Group"}</p>
          <p className="text-xs text-white/80 truncate">
            {group?.group_member?.length
              ? group.group_member.map((member) => member.fullName).join(", ")
              : "0 members"}
          </p>
        </div>

        <div ref={headerMenuRef} className="relative ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white/15 dark:bg-[#111b21] border border-white/20 dark:border-[#2a3942] rounded-full px-3 py-1.5 text-white">
            <IoSearchOutline className="text-lg text-white/80 dark:text-[#8696a0]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search group"
              className="w-32 md:w-44 bg-transparent outline-none text-sm text-white dark:text-[#e9edef] placeholder:text-white/70 dark:placeholder:text-[#8696a0]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowHeaderMenu((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/15 dark:hover:bg-[#2a3942] transition"
          >
            <BsThreeDotsVertical />
          </button>

          {showHeaderMenu && (
            <div className="absolute right-0 top-11 w-48 bg-white dark:bg-[#233138] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a3942] overflow-hidden z-30">
              <div className="sm:hidden px-3 py-2 border-b border-gray-100 dark:border-[#2a3942]">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search group"
                  className="w-full bg-gray-100 dark:bg-[#111b21] rounded-lg px-3 py-2 outline-none text-sm text-gray-900 dark:text-[#e9edef] placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
                />
              </div>
              <button type="button" onClick={() => { setShowGroupInfo(true); setShowHeaderMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-100 dark:hover:bg-[#2a3942]">
                Group Info
              </button>
              <button type="button" onClick={() => { handleExitGroup(); setShowHeaderMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#2a3942]">
                Exit Group
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a] px-2 sm:px-4 py-3">
        {filteredMessages.length === 0 && searchText.trim() ? (
          <div className="flex justify-center mt-6">
            <span className="bg-white/80 dark:bg-[#182229] text-gray-600 dark:text-[#8696a0] text-sm px-4 py-2 rounded-lg shadow-sm">
              No messages found
            </span>
          </div>
        ) : null}
        {filteredMessages.map((msg, index) => {
          const isMe = getId(msg.senderId) === currentUserId;
          const isDeletedForEveryone = msg.deletedForEveryone;
          const deletedByMe = getId(msg.deletedForEveryoneBy) === currentUserId;
          const previousMsg = filteredMessages[index - 1];
          const showDate = !previousMsg || new Date(previousMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

          return (
            <div key={msg._id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="bg-white/80 dark:bg-[#182229] text-gray-600 dark:text-[#8696a0] text-xs px-3 py-1 rounded-lg shadow-sm">
                    {formatDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}

              <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`p-2 rounded-lg shadow max-w-[85%] sm:max-w-[75%] break-words text-gray-900 dark:text-[#e9edef] ${isMe ? "bg-[#dcf8c6] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none"}`}>
                  {!isMe && <p className="text-[11px] font-semibold text-primary dark:text-[#00a884] mb-1">{msg.senderId?.fullName || "Member"}</p>}

                  {isDeletedForEveryone ? (
                    <p className="text-sm italic text-gray-500 dark:text-[#8696a0]">
                      {deletedByMe ? "You deleted this message" : "This message was deleted"}
                    </p>
                  ) : (
                    <>
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
                    </>
                  )}

                  <div className={`flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-[#8696a0] ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isDeletedForEveryone && (
                      <div className="relative mr-1">
                        <button
                          type="button"
                          onClick={() => setOpenDeleteMenu(openDeleteMenu === msg._id ? null : msg._id)}
                          className="rounded-full p-1 text-gray-400 hover:bg-black/10 hover:text-red-500 dark:hover:bg-white/10"
                          title="Delete message"
                        >
                          <MdDeleteOutline className="text-sm" />
                        </button>

                        {openDeleteMenu === msg._id && (
                          <div className={`absolute bottom-6 ${isMe ? "right-0" : "left-0"} z-20 w-44 overflow-hidden rounded-xl bg-white text-gray-800 shadow-lg border border-gray-100 dark:bg-[#233138] dark:text-[#e9edef] dark:border-[#2a3942]`}>
                            <button
                              type="button"
                              onClick={() => { handleDeleteMessage(msg._id, "me"); setOpenDeleteMenu(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#2a3942]"
                            >
                              Delete for me
                            </button>
                            {canDeleteForEveryone(msg) && (
                              <button
                                type="button"
                                onClick={() => { handleDeleteMessage(msg._id, "everyone"); setOpenDeleteMenu(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#2a3942]"
                              >
                                Delete for everyone
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="relative bg-[#F0F0F0] dark:bg-[#202c33] px-2 sm:px-3 py-3 sm:py-4 flex items-end gap-1 sm:gap-2 border-t border-gray-200 dark:border-[#2a3942]">
        {showEmoji && (
          <div className="absolute bottom-full left-3 mb-2 bg-white dark:bg-[#233138] rounded-2xl shadow-lg border border-gray-200 dark:border-[#2a3942] p-3 grid grid-cols-5 gap-2 z-10">
            {emojis.map((emoji) => (
              <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg p-1">
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button type="button" onClick={() => setShowEmoji((prev) => !prev)} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] ${showEmoji ? "bg-gray-200 dark:bg-[#2a3942]" : ""}`}>
          <BsEmojiSmile className="text-xl text-gray-600 dark:text-[#8696a0]" />
        </button>

        <button type="button" onClick={() => fileInputRef.current.click()} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942]">
          <GrGallery className="text-xl text-gray-600 dark:text-[#8696a0]" />
        </button>

        <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*,audio/*" onChange={handleFileChange} />

        <div className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
            {fileUrl.map(({ file, previewUrl }, i) => (
              <div className="relative bg-white dark:bg-[#111b21] rounded-2xl p-1 shadow-sm" key={`${file.name}-${i}`}>
                {file.type.startsWith("image") && <img src={previewUrl} alt={file.name} className="w-24 h-24 rounded-xl object-cover" />}
                {file.type.startsWith("video") && <video src={previewUrl} controls className="w-24 h-24 rounded-xl object-cover" />}
                {file.type.startsWith("audio") && (
                  <div className="w-44 sm:w-56 p-2">
                    <p className="text-xs text-gray-600 dark:text-[#8696a0] mb-1 truncate">{file.name}</p>
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
            className="w-full bg-white dark:bg-[#2a3942] border border-gray-300 dark:border-[#2a3942] rounded-full px-4 py-2 outline-none text-sm text-gray-900 dark:text-[#e9edef] placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
          />
        </div>

        <button type="button" onClick={recording ? stopRecording : startRecording} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-gray-200 dark:bg-[#2a3942]"}`}>
          {recording ? <FaStop className="text-white" /> : <FaMicrophone className="text-gray-600 dark:text-[#8696a0]" />}
        </button>

        <button onClick={handleSend} disabled={sending} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full ${sending ? "bg-gray-400" : "bg-primary"}`}>
          <IoSend className="text-white" />
        </button>
      </div>

      {showGroupInfo && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-3">
          <div className="bg-white dark:bg-[#202c33] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-xl text-gray-900 dark:text-[#e9edef]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Group Info</h2>
              <button type="button" onClick={() => setShowGroupInfo(false)} className="text-gray-500 hover:text-gray-800 dark:text-[#8696a0] dark:hover:text-[#e9edef]">✕</button>
            </div>

            <div className="flex flex-col items-center text-center border-b border-gray-200 dark:border-[#2a3942] pb-4">
              <div className="relative w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden text-3xl font-semibold">
                {editGroupIconPreview || group?.group_icon ? (
                  <img src={editGroupIconPreview || group.group_icon} alt={group?.group_name} className="w-full h-full object-cover" />
                ) : (
                  (group?.group_name || "G").charAt(0)
                )}
              </div>
              {isGroupAdmin && (
                <>
                  <input type="file" ref={editIconInputRef} hidden accept="image/*" onChange={handleEditIconChange} />
                  <button type="button" onClick={() => editIconInputRef.current?.click()} className="mt-2 text-sm font-medium text-primary dark:text-[#00a884]">
                    Change Photo
                  </button>
                </>
              )}

              {isGroupAdmin ? (
                <div className="mt-4 w-full space-y-3">
                  <input
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder="Group name"
                    className="w-full border border-gray-300 dark:border-[#2a3942] rounded-xl px-4 py-2 outline-none focus:border-primary dark:focus:border-[#00a884] bg-white dark:bg-[#111b21] text-gray-900 dark:text-[#e9edef]"
                  />
                  <textarea
                    value={editGroupDescription}
                    onChange={(e) => setEditGroupDescription(e.target.value)}
                    placeholder="Description"
                    rows="2"
                    className="w-full border border-gray-300 dark:border-[#2a3942] rounded-xl px-4 py-2 outline-none focus:border-primary dark:focus:border-[#00a884] resize-none bg-white dark:bg-[#111b21] text-gray-900 dark:text-[#e9edef]"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateGroup}
                    disabled={updatingGroup || !editGroupName.trim()}
                    className={`w-full rounded-full py-2 text-sm font-medium text-white ${updatingGroup || !editGroupName.trim() ? "bg-gray-400" : "bg-primary"}`}
                  >
                    {updatingGroup ? "Updating..." : "Update Group"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-3 font-semibold text-lg">{group?.group_name}</p>
                  <p className="text-sm text-gray-500 dark:text-[#8696a0]">{group?.group_member?.length || 0} members</p>
                  {group?.des && <p className="mt-2 text-sm text-gray-600 dark:text-[#8696a0]">{group.des}</p>}
                  <p className="mt-2 rounded-full bg-gray-100 dark:bg-[#111b21] px-3 py-1 text-xs text-gray-500 dark:text-[#8696a0]">Only admins can edit group info</p>
                </>
              )}
            </div>

            {isGroupAdmin && (
              <div className="mt-4 border-b border-gray-200 dark:border-[#2a3942] pb-4">
                <p className="text-sm font-medium mb-2">Add Members</p>
                {availableContacts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-[#8696a0]">No contacts available to add</p>
                ) : (
                  <>
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 dark:border-[#2a3942]">
                      {availableContacts.map((contact) => (
                        <label key={contact._id} className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-[#2a3942] last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111b21]">
                          <input
                            type="checkbox"
                            checked={selectedAddMembers.includes(contact._id)}
                            onChange={() => toggleAddMember(contact._id)}
                          />
                          <span className="text-sm truncate">{contact.fullName}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMembers}
                      disabled={addingMembers || selectedAddMembers.length === 0}
                      className={`mt-3 w-full rounded-full py-2 text-sm font-medium text-white ${addingMembers || selectedAddMembers.length === 0 ? "bg-gray-400" : "bg-primary"}`}
                    >
                      {addingMembers ? "Adding..." : "Add Selected Members"}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Members</p>
              <div className="space-y-2">
                {group?.group_member?.map((member) => {
                  const isAdminMember = group?.group_admin?.some((admin) => (admin?._id || admin) === member._id);
                  return (
                    <div key={member._id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-[#111b21]">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden shrink-0">
                        {member.profilePic ? (
                          <img src={member.profilePic} alt={member.fullName} className="w-full h-full object-cover" />
                        ) : (
                          (member.fullName || "?").charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{member.fullName}</p>
                          {isAdminMember && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary dark:text-[#00a884]">Admin</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate">{member.email}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setShowGroupInfo(false); handleExitGroup(); }}
              className="mt-5 w-full rounded-full bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Exit Group
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Group
