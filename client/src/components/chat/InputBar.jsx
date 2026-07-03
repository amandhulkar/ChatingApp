// import { GrGallery } from "react-icons/gr";
// import { FaMicrophone } from "react-icons/fa";
// import { BsEmojiSmile } from "react-icons/bs";
// import axios from "axios";
// import { API_BASE_URL } from "../../api/config";
// import { useSocket } from "../../context/SocketContext";
// import { useParams } from "react-router-dom";
// import { IoSend } from "react-icons/io5";
// import { useRef, useState } from "react";

// const InputBar = () => {
//   const [fileUrl, setFileUrl] = useState([]);
//   const [text, setText] = useState("");
//   const [sending, setSending] = useState(false);

//   const { token, socketConnected, onlineUsers } = useSocket();
//   const { userId } = useParams();
//   const fileInputRef = useRef()

//   const handleSend = async () => {
//     setSending(true);
//     try {
//       const formData = new FormData();
//       formData.append("text", text);
//       fileUrl.forEach((file) => {
//         formData.append("files", file);
//       });
//       const res = await axios.post(
//         `${API_BASE_URL}/api/send-message/${userId}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       console.log(res.data.data);
//       setText("");
//       setFileUrl([]);
//     } catch (error) {
//       console.log(error.response);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="bg-[#F0F0F0] px-3 py-4 flex items-center gap-2 border-t border-gray-200">
//       <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
//         <BsEmojiSmile className="text-xl text-gray-600" />
//       </button>

//       <button onClick={() => fileInputRef.current.click()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
//         <GrGallery className="text-xl text-gray-600" />
//       </button>

//       <input
//         type="file"
//         ref={fileInputRef}
//         hidden
//         multiple
//         onChange={(e) => setFileUrl([...e.target.files])}
//       />
//       <div>
//         {
//           fileUrl.map((file, i) => (
//             <div key={i}>
//               {file.type.startsWith("image") && (
//                 <img src={URL.createObjectURL(file)} alt="image" className="w-24 h-24 rounded-2xl object-cover" />
//               )}
//             </div>
//           ))
//         }
//       </div>

//       <input
//         type="text"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type a message..."
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && !sending) {
//             handleSend()
//           }
//         }}

//         className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 outline-none text-sm"
//       />

//       <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200">
//         <FaMicrophone className="text-gray-600" />
//       </button>

//       <button
//         onClick={handleSend}
//         disabled={sending}
//         className={`w-10 h-10 flex items-center justify-center rounded-full 
//           ${sending ? "bg-gray-400" : "bg-primary"}`}
//       >
//         <IoSend className="text-white" />
//       </button>
//     </div>
//   );
// };

// export default InputBar;


import { GrGallery } from "react-icons/gr";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import axios from "axios";
import { API_BASE_URL } from "../../api/config";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import { useRef, useState } from "react";

const InputBar = ({ setMessages }) => {
  const [fileUrl, setFileUrl] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);

  const { token } = useSocket();
  const { userId } = useParams();
  const fileInputRef = useRef()
  const messageInputRef = useRef()
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const emojis = ["😀", "😂", "😍", "🥰", "😎", "😭", "😡", "👍", "🙏", "🔥", "❤️", "🎉", "🤣", "😘", "😋", "😢", "🤔", "👌", "💯", "✨"]

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

  const handleSend = async () => {
    if (sending || (!text.trim() && fileUrl.length === 0)) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      fileUrl.forEach(({ file }) => {
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
  };
  const handleRemoveFile = (index) => {
    setFileUrl((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    })
  }

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji)
    messageInputRef.current?.focus()
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
    <div className="relative bg-[#F0F0F0] px-2 sm:px-3 py-3 sm:py-4 flex items-end gap-1 sm:gap-2 border-t border-gray-200">
      {showEmoji && (
        <div className="absolute bottom-full left-3 mb-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 grid grid-cols-5 gap-2 z-10">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:bg-gray-100 rounded-lg p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowEmoji((prev) => !prev)}
        className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200 ${showEmoji ? "bg-gray-200" : ""}`}
      >
        <BsEmojiSmile className="text-xl text-gray-600" />
      </button>

      <button type="button" onClick={() => fileInputRef.current.click()} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200">
        <GrGallery className="text-xl text-gray-600" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
      />
      <div className="flex-1 min-w-0">
        {
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
            {fileUrl.map(({ file, previewUrl }, i) => (
              <div className="relative bg-white rounded-2xl p-1 shadow-sm" key={`${file.name}-${i}`} >
                {file.type.startsWith("image") && (
                  <img src={previewUrl} alt={file.name} className="w-24 h-24 rounded-xl object-cover" />
                )}
                {file.type.startsWith("video") && (
                  <video src={previewUrl} controls className="w-24 h-24 rounded-xl object-cover" />
                )}
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
        }
        <div className="flex justify-center items-center mt-3">
          <input
            ref={messageInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) {
                handleSend()
              }
            }}

            className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 outline-none text-sm"
          />
        </div>
      </div>


      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-gray-200"}`}
      >
        {recording ? <FaStop className="text-white" /> : <FaMicrophone className="text-gray-600" />}
      </button>

      <button
        onClick={handleSend}
        disabled={sending}
        className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full
          ${sending ? "bg-gray-400" : "bg-primary"}`}
      >
        <IoSend className="text-white" />
      </button>
    </div>
  );
};

export default InputBar;
