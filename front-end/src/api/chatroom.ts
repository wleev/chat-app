import type ChatRoom from "@/models/chatroom"

const BASE_URL = new URL("chatrooms", import.meta.env.VITE_API_BASE)

export async function getChatrooms(): Promise<ChatRoom[]> {
  const response = await fetch(BASE_URL.href)
  const chatrooms: ChatRoom[] = await response.json()
  return chatrooms
}
