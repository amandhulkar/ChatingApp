import { GrGallery } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import axios from "axios";
import { API_BASE_URL } from "../../api/config";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import { useRef, useState } from "react";

const InputBar = () => {
  const [fileUrl, setFileUrl] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const { token, socketConnected, onlineUsers } = useSocket();
  const { userId } = useParams();
  const fileInputRef = useRef()

  const handleSend = async () => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      fileUrl.forEach((file) => {
        formData.append("files", file);
      });
      const res = await axios.post(
        `${API_BASE_URL}/api/send-message/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(res.data.data);
      setText("");
      setFileUrl([]);
    } catch (error) {
      console.log(error.response);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#F0F0F0] px-3 py-4 flex items-center gap-2 border-t border-gray-200">
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
        <BsEmojiSmile className="text-xl text-gray-600" />
      </button>

      <button onClick={() => fileInputRef.current.click()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
        <GrGallery className="text-xl text-gray-600" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        multiple
        onChange={(e) => setFileUrl([...e.target.files])}
      />
      <div>
        {
          fileUrl.map((file, i) => (
            <div key={i}>
              {file.type.startsWith("image") && (
                <img src={URL.createObjectURL(file)} alt="image" className="w-24 h-24 rounded-2xl object-cover" />
              )}
            </div>
          ))
        }
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !sending) {
            handleSend()
          }
        }}

        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 outline-none text-sm"
      />

      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200">
        <FaMicrophone className="text-gray-600" />
      </button>

      <button
        onClick={handleSend}
        disabled={sending}
        className={`w-10 h-10 flex items-center justify-center rounded-full 
          ${sending ? "bg-gray-400" : "bg-primary"}`}
      >
        <IoSend className="text-white" />
      </button>
    </div>
  );
};

export default InputBar;
