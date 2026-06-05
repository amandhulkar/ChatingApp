import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-3 bg-[#075E54] flex items-center gap-3">
      <button
        onClick={() => navigate("/chat")}
        className=" text-white text-2xl mr-1 p-2 -m-2"
      >
        <IoArrowBackCircleOutline />
      </button>

      <div
        className="w-9 h-9 rounded-full bg-white text-[#272626] flex items-center justify-center font-medium text-lg overflow-hidden cursor-pointer"
      >
        A
      </div>

      <div>
        <p className="text-white font-medium text-sm">User Name</p>
        <p className="text-xs text-green-300">
          🟢 Online
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;