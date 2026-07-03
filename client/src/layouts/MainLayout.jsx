import React, { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useSocket } from "../context/SocketContext";

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
  const isConversationOpen = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/group/");
  const token = localStorage.getItem("token");
  const { socketRef } = useSocket();
  const fileInputRef = useRef();

  const user = {
    fullName: "Aman",
  };

  const fetchContacts = async () => {
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
  }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleGroupCreated = () => fetchGroups();
    socket.on("groupCreated", handleGroupCreated);

    return () => {
      socket.off("groupCreated", handleGroupCreated);
    }
  }, [socketRef]);

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

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      <div className={`bg-gray-100 w-full md:w-80 shrink-0 p-3 border-r border-gray-300 overflow-hidden ${isConversationOpen ? "hidden md:block" : "block"}`}>
        <div className="bg-primary px-4 py-4 flex items-center justify-between">
          <div className="text-white font-semibold text-lg truncate">
            {user.fullName}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={handlePlusClick} className="text-white/80 cursor-pointer text-xl">
              <FaPlus />
            </button>
            <div
              onClick={() => navigate("/profile")}
              className="text-white/80 cursor-pointer text-xl"
            >
              <CgProfile />
            </div>
          </div>
        </div>

        <div className="flex border-b justify-between border-gray-300 bg-gray-200">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 text-sm font-medium transition
              ${
                activeTab === "chats"
                  ? "text-[#075E54] border-b-2 border-[#075E54]"
                  : "text-gray-500"
              }`}
          >
            Chats
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 text-sm font-medium transition
              ${
                activeTab === "groups"
                  ? "text-[#075E54] border-b-2 border-[#075E54]"
                  : "text-gray-500"
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
                  onClick={() => navigate(`/chat/${c._id}`)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-300 border-b border-gray-100 transition"
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

                  <div className="min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {c.fullName}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      online
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {groups.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p>No Group Found</p>
                  <button type="button" onClick={() => setShowGroupModal(true)} className="mt-3 text-primary font-medium">
                    Create group
                  </button>
                </div>
              ) : (
                groups.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => navigate(`/group/${g._id}`)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-300 border-b border-gray-100 transition"
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
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {g.group_name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Group</h2>
              <button type="button" onClick={resetGroupForm} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-primary"
              />

              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Description (optional)"
                className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-primary resize-none"
                rows="2"
              />

              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) => setGroupIcon(e.target.files?.[0] || null)}
              />

              <button type="button" onClick={() => fileInputRef.current?.click()} className="border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50">
                {groupIcon ? groupIcon.name : "Choose group icon"}
              </button>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Select members</p>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto">
                  {contacts.map((contact) => (
                    <label key={contact._id} className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(contact._id)}
                        onChange={() => toggleMember(contact._id)}
                      />
                      <span className="text-sm text-gray-800 truncate">{contact.fullName}</span>
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
