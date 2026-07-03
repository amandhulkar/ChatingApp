// import React from "react";
// import ChatHeader from "../components/chat/ChatHeader";
// import MessageArea from "../components/chat/MessageArea";
// import InputBar from "../components/chat/InputBar";
// import { useParams } from "react-router-dom";

// const Chat = () => {
//   const { userId } = useParams();
//   console.log(userId);

//   return (
//     <>
//       <div className="flex flex-col h-screen">
//         <ChatHeader />
//         <MessageArea />
//         <InputBar />
//       </div>
//     </>
//   );
// };

// export default Chat;


import ChatHeader from '../components/chat/ChatHeader'
import MessageArea from '../components/chat/MessageArea'
import InputBar from '../components/chat/InputBar'
import { useState } from 'react'

const Chat = () => {
  const [messages, setMessages] = useState([])

  return (
    <>
      <div className='flex flex-col h-screen min-w-0 overflow-hidden'>
        <ChatHeader />
        <MessageArea  setMessages={setMessages} messages={messages}/>
        <InputBar setMessages={setMessages} />
      </div>
    </>
  )
}

export default Chat
