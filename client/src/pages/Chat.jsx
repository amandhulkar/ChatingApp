import React from 'react'
import ChatHeader from '../components/chat/ChatHeader'
import MessageArea from '../components/chat/MessageArea'
import InputBar from '../components/chat/InputBar'
import { useParams } from 'react-router-dom'

const Chat = () => {
  const {userId} = useParams();
  console.log(userId);
  
  return (
    <>
      <ChatHeader/>
      <MessageArea/>
      <InputBar/>
    </>
  )
}

export default Chat