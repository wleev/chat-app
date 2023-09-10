import ChatRoom from "../models/chatroom"
import Message from "../models/message"
import { getByNickname } from "./user"

export const addMessage = async (
  userName: string,
  roomName: string,
  content: string,
): Promise<Message> => {
  const user = await getByNickname(userName)
  if (!user) {
    throw new Error("Error: User associated with message not found")
  }

  const chatRoom = await ChatRoom.findOne({ where: { name: roomName } })
  if (!chatRoom) {
    throw new Error("Error: Chat room associated with message not found")
  }

  const message = await Message.create({
    content,
    timestamp: new Date(),
    senderId: user.id,
    chatRoomId: chatRoom.id,
  })
  return message
}

export const editMessage = async (
  userName: string,
  roomName: string,
  messageId: number,
  content: string,
): Promise<Message> => {
  const user = await getByNickname(userName)
  if (!user) {
    throw new Error("Error: User associated with message not found")
  }

  const chatRoom = await ChatRoom.findOne({ where: { name: roomName } })
  if (!chatRoom) {
    throw new Error("Error: Chat room associated with message not found")
  }

  const message = await Message.findOne({ where: { id: messageId } })
  if (!message) {
    throw new Error("Error: Message not found")
  }

  if (message.senderId !== user.id) {
    throw new Error("Error: User not authorized to edit message")
  }

  if (message.chatRoomId !== chatRoom.id) {
    throw new Error("Error: Message not associated with chat room")
  }

  message.content = content
  message.edited = true
  return await message.save()
}

export const getByChatRoomId = async (
  chatRoomId: number,
  page: number,
  pageSize: number,
): Promise<Message[]> => {
  const messages = await Message.findAll({
    where: { chatRoomId },
    offset: page * pageSize,
    limit: pageSize,
    order: [["timestamp", "DESC"]],
  })
  return messages
}
