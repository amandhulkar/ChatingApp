import React from "react";

const MessageArea = () => {
  return (
    <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto">
      <div className="flex justify-end mb-3">
        <div className="bg-green-200 px-3 py-2 rounded-lg max-w-xs">
          Hello 👋
        </div>
      </div>

      <div className="flex justify-start mb-3">
        <div className="bg-white px-3 py-2 rounded-lg max-w-xs">
          Hi Aman 😄
        </div>
      </div>
    </div>
  );
};

export default MessageArea;