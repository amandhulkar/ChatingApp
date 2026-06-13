// import React from "react";

// const MessageArea = () => {
//   return (
//     <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto">
//       <div className="flex justify-end mb-3">
//         <div className="bg-green-200 px-3 py-2 rounded-lg max-w-xs">
//           Hello 👋
//         </div>
//       </div>

//       <div className="flex justify-start mb-3">
//         <div className="bg-white px-3 py-2 rounded-lg max-w-xs">
//           Hi Aman 😄
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageArea;

import axios from "axios";
import React from "react";
import { API_BASE_URL } from "../../api/config";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";

const MessageArea = ({ messages, setMessages }) => {
  const { userId } = useParams();
  const { token, socketConnected, socketRef } = useSocket();

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

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((msg) => {
        return (
            <div key={msg._id} className="flex mb-2 ">
              <div className="bg-[#DCF9c6] p-2 rounded-lg shadow  max-w-[70%]">
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
              </div>
            </div>
        );
      })}
    </div>
  );
};

export default MessageArea;
