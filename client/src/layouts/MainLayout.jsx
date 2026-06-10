import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { Outlet, useNavigate, } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
// Aman Dhulkar
const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // console.log(token);
  // if (!token) {
  //   navigate("/login");
  // }

  const user = {
    fullName: "Aman",
  };
  // const contacts = [
  //   {
  //     _id: 1,
  //     fullName: "Aman Dhulkar",
  //     profilePic:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s",
  //   },
  //   {
  //     _id: 2,
  //     fullName: "Aman 1",
  //     profilePic:
  //       "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
  //   },
  //   {
  //     _id: 3,
  //     fullName: "Aman 2",
  //     profilePic:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s",
  //   },
  //   {
  //     _id: 4,
  //     fullName: "Aman 3",
  //     profilePic:
  //       "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
  //   },
  //   {
  //     _id: 5,
  //     fullName: "Aman 4",
  //     profilePic: "",
  //   },
  // ];

  const groups = [
    {
      _id: "1",
      groupIcon: "A",
      groupName: "MyGroup",
      participants: "1",
    },
    {
      _id: "2",
      groupIcon: "A",
      groupName: "MyGroup",
      participants: "1",
    },
  ];

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getAllContacts`, {
        headers: {
          Authorization: `Bearer ${token} `,
        },
      });
      console.log(res.data.data);
      setContacts(res.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, []);

  
  return (
    <div className="h-screen w-screen flex">
      {/* sidebar */}
      {/* <div className="bg-gray-100 w-1/4 p-3"> */}
      {/* <div className="bg-gray-100 w-50 p-3"> */}
      {/* <div className="bg-gray-100 w-87 p-3 border-r border-gray-300"> */}
      <div className="bg-gray-100 w-80 p-3 border-r border-gray-300">
        {/* header */}
        <div className="bg-primary px-4 py-4 flex items-center justify-between">
          {/* <div className="text-white font-semibold text-lg"> */}
          <div className="text-white font-semibold text-lg truncate">
            {user.fullName}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-white/80 cursor-pointer text-xl ">
              <FaPlus />
            </div>
            <div
              onClick={() => navigate("/profile")}
              className="text-white/80 cursor-pointer text-xl"
            >
              <CgProfile />
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* contacts */}
        <div
          style={{
            height: "calc(100vh - 160px)",
            overflow: "auto",
          }}
        >
          {activeTab === "chats" ? (
            <>
              {contacts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/chat/${c._id}`)}
                  // className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100"
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
                        // c.fullName.charAt(0)
                        (c.fullName || c.FullName || "?").charAt(0)
                      )}
                    </div>
                  </div>

                  <div className="">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 text-sm">
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
                </div>
              ) : (
                groups.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => navigate(`/group/${g._id}`)}
                    // className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100"
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-300 border-b border-gray-100 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden">
                      {g.groupIcon ? (
                        <img
                          src={g.groupIcon}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // g.groupName.charAt(0)
                        (g.groupName || "?").charAt(0)

                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {g.groupName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {g.participants.length} members
                      </p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Right section  */}
      <div className="flex flex-col flex-1 overflow-hidden ">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

