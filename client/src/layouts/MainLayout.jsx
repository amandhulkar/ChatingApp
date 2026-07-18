import { useState, useEffect, useRef } from "react";
import { FaMoon, FaPlus, FaSun } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_ABOUT = "Hey there! I am using ChatingApp.";

const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isConversationOpen = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/group/") || location.pathname.startsWith("/profile");
  const { token, socketRef } = useSocket();
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
  const { isDark, toggleTheme } = useTheme();
  const fileInputRef = useRef();

  const user = {
    fullName: "Aman",
  };

  const fetchContacts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getAllContacts`, {
        headers: {
          Authorization: `Bearer ${token} `,
        },
      });
      setContacts(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const fetchGroups = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/my-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, [token]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleGroupCreated = () => fetchGroups();
    const handleGroupUpdated = () => fetchGroups();
    const handleNewMessage = (msg) => {
      const senderId = msg.senderId?._id || msg.senderId;
      const isOpenChat = location.pathname === `/chat/${senderId}`;

      if (isOpenChat) return;

      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === senderId
            ? { ...contact, unreadCount: (contact.unreadCount || 0) + 1 }
            : contact
        )
      );
    };

    const handleNewGroupMessage = (msg) => {
      const groupId = msg.groupId?._id || msg.groupId;
      const senderId = msg.senderId?._id || msg.senderId;
      const isOpenGroup = location.pathname === `/group/${groupId}`;

      if (isOpenGroup || senderId === currentUserId) return;

      setGroups((prev) =>
        prev.map((group) =>
          group._id === groupId
            ? { ...group, unreadCount: (group.unreadCount || 0) + 1 }
            : group
        )
      );
    };

    socket.on("groupCreated", handleGroupCreated);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);

    return () => {
      socket.off("groupCreated", handleGroupCreated);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
    }
  }, [socketRef, location.pathname, currentUserId]);

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) return prev.filter((id) => id !== memberId);
      return [...prev, memberId];
    });
  }

  const resetGroupForm = () => {
    setGroupName("");
    setGroupDescription("");
    setGroupIcon(null);
    setSelectedMembers([]);
    setShowGroupModal(false);
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || creatingGroup) return;

    setCreatingGroup(true);
    try {
      const formData = new FormData();
      formData.append("group_name", groupName.trim());
      formData.append("des", groupDescription.trim());
      formData.append("group_member", JSON.stringify(selectedMembers));
      if (groupIcon) formData.append("group_icon", groupIcon);

      const res = await axios.post(`${API_BASE_URL}/api/create-group`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchGroups();
      resetGroupForm();
      navigate(`/group/${res.data.data._id}`);
    } catch (error) {
      console.log(error.response);
    } finally {
      setCreatingGroup(false);
    }
  }

  const handlePlusClick = () => {
    if (activeTab === "groups") {
      setShowGroupModal(true);
      return;
    }
  }

  const handleOpenChat = (contactId) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact._id === contactId ? { ...contact, unreadCount: 0 } : contact
      )
    );
    navigate(`/chat/${contactId}`);
  }

  const handleOpenGroup = (groupId) => {
    setGroups((prev) =>
      prev.map((group) =>
        group._id === groupId ? { ...group, unreadCount: 0 } : group
      )
    );
    navigate(`/group/${groupId}`);
  }

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-white text-gray-900 dark:bg-[#111b21] dark:text-[#e9edef]">
      <div className={`bg-gray-100 dark:bg-[#111b21] w-full md:w-80 shrink-0 p-3 border-r border-gray-300 dark:border-[#2a3942] overflow-hidden ${isConversationOpen ? "hidden md:block" : "block"}`}>
        <div className="bg-primary px-4 py-4 flex items-center justify-between">
          <div className="text-white font-semibold text-lg truncate">
            {user.fullName}
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "groups" && (
              <button type="button" onClick={handlePlusClick} className="text-white/80 hover:text-white cursor-pointer text-xl">
                <FaPlus />
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="text-white/80 hover:text-white cursor-pointer text-xl"
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            <div
              onClick={() => navigate("/profile")}
              className="text-white/80 hover:text-white cursor-pointer text-xl"
            >
              <CgProfile />
            </div>
          </div>
        </div>

        <div className="flex border-b justify-between border-gray-300 bg-gray-200 dark:border-[#2a3942] dark:bg-[#202c33]">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 text-sm font-medium transition
              ${
                activeTab === "chats"
                  ? "text-[#075E54] border-b-2 border-[#075E54] dark:text-[#00a884] dark:border-[#00a884]"
                  : "text-gray-500 dark:text-[#8696a0]"
              }`}
          >
            Chats
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 text-sm font-medium transition
              ${
                activeTab === "groups"
                  ? "text-[#075E54] border-b-2 border-[#075E54] dark:text-[#00a884] dark:border-[#00a884]"
                  : "text-gray-500 dark:text-[#8696a0]"
              }`}
          >
            Groups
          </button>
        </div>

        <div className="h-[calc(100vh-160px)] overflow-auto">
          {activeTab === "chats" ? (
            <>
              {contacts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleOpenChat(c._id)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-[#202c33] border-b border-gray-100 dark:border-[#2a3942] transition"
                >
                  <div className="relative ">
                    <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden">
                      {c.profilePic ? (
                        <img
                          src={c.profilePic}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (c.fullName || c.FullName || "?").charAt(0)
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-[#e9edef] text-sm truncate">
                        {c.fullName}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          {c.unreadCount > 99 ? "99+" : c.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate mt-0.5">
                      {c.about || DEFAULT_ABOUT}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {groups.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-[#8696a0] text-sm">
                  <p>No Group Found</p>
                  <button type="button" onClick={() => setShowGroupModal(true)} className="mt-3 text-primary dark:text-[#00a884] font-medium">
                    Create group
                  </button>
                </div>
              ) : (
                groups.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => handleOpenGroup(g._id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-[#202c33] border-b border-gray-100 dark:border-[#2a3942] transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden shrink-0">
                      {g.group_icon ? (
                        <img
                          src={g.group_icon}
                          alt={g.group_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (g.group_name || "?").charAt(0)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-[#e9edef] text-sm truncate">
                          {g.group_name}
                        </p>
                        {g.unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            {g.unreadCount > 99 ? "99+" : g.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate">
                        {g.group_member?.length || 0} members
                      </p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className={`flex-col flex-1 min-w-0 overflow-hidden ${isConversationOpen ? "flex" : "hidden md:flex"}`}>
        <Outlet />
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-3">
          <form onSubmit={handleCreateGroup} className="bg-white dark:bg-[#202c33] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-xl text-gray-900 dark:text-[#e9edef]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#e9edef]">Create Group</h2>
              <button type="button" onClick={resetGroupForm} className="text-gray-500 hover:text-gray-800 dark:text-[#8696a0] dark:hover:text-[#e9edef]">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="border border-gray-300 dark:border-[#2a3942] rounded-xl px-4 py-2 outline-none focus:border-primary dark:focus:border-[#00a884] bg-white dark:bg-[#111b21] text-gray-900 dark:text-[#e9edef] placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
              />

              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Description (optional)"
                className="border border-gray-300 dark:border-[#2a3942] rounded-xl px-4 py-2 outline-none focus:border-primary dark:focus:border-[#00a884] resize-none bg-white dark:bg-[#111b21] text-gray-900 dark:text-[#e9edef] placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
                rows="2"
              />

              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) => setGroupIcon(e.target.files?.[0] || null)}
              />

              <button type="button" onClick={() => fileInputRef.current?.click()} className="border border-dashed border-gray-300 dark:border-[#2a3942] rounded-xl py-3 text-sm text-gray-600 dark:text-[#8696a0] hover:bg-gray-50 dark:hover:bg-[#111b21]">
                {groupIcon ? groupIcon.name : "Choose group icon"}
              </button>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-[#e9edef] mb-2">Select members</p>
                <div className="border border-gray-200 dark:border-[#2a3942] rounded-xl max-h-56 overflow-y-auto">
                  {contacts.map((contact) => (
                    <label key={contact._id} className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-[#2a3942] last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111b21]">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(contact._id)}
                        onChange={() => toggleMember(contact._id)}
                      />
                      <span className="text-sm text-gray-800 dark:text-[#e9edef] truncate">{contact.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingGroup || !groupName.trim()}
                className={`rounded-full py-2 text-white font-medium ${creatingGroup || !groupName.trim() ? "bg-gray-400" : "bg-primary"}`}
              >
                {creatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
