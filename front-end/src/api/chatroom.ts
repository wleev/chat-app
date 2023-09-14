import type ChatRoom from "@/models/chatroom"

const BASE_URL = new URL("chatrooms", import.meta.env.VITE_API_BASE)

export async function getChatrooms(): Promise<ChatRoom[]> {
  const response = await fetch(BASE_URL.href)
  const chatrooms: ChatRoom[] = await response.json()
  return chatrooms
}

export async function createChatRoom(
  name: string,
  userId: number,
): Promise<void> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, userId }),
  })

  if (!response.ok) {
    throw new Error("Error: Chat room not created")
  }
}
