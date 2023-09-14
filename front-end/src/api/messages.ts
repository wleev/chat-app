import type Message from "@/models/message"
import type User from "@/models/user"

const BASE_URL = new URL(
  "messages",
  import.meta.env.VITE_API_BASE || (window as any).env.API_URL,
).href
const BYROOM_URL = BASE_URL + "/by-chatroom"

interface ChatRoomMessageRequest {
  chatRoomId: number
  page: number
  pageSize: number
}

export async function getMessages(
  request: ChatRoomMessageRequest,
): Promise<Message[]> {
  const response = await fetch(BYROOM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
    }),
  })

  const messagesJSON: {
    id: string
    sender: User
    content: string
    timestamp: Date
  }[] = await response.json()
  const messages: Message[] = messagesJSON.map((message) => ({
    id: message.id,
    sender: message.sender.nickname,
    content: message.content,
    timestamp: message.timestamp,
  }))
  return messages
}
