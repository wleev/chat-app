import type User from "@/models/user"

const BASE_URL = new URL("/user", import.meta.env.VITE_API_BASE).href
console.log("BASE_URL", BASE_URL)

const LOGIN = BASE_URL + "/login"
const CREATE_CHATROOM = BASE_URL + "/create-chatroom"

export async function login(username: string): Promise<User> {
  const response = await fetch(LOGIN, {
    method: "POST",
    body: JSON.stringify({ username }),
  })

  if (!response.ok) {
    throw new Error("Error: User not found")
  }

  const user: User = await response.json()
  return user
}

export async function createChatRoom(
  name: string,
  userId: number,
): Promise<void> {
  const response = await fetch(CREATE_CHATROOM, {
    method: "POST",
    body: JSON.stringify({ name, userId }),
  })

  if (!response.ok) {
    throw new Error("Error: Chat room not created")
  }
}
