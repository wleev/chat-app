import { getChatrooms } from "@/api/chatroom"
import type { ChatUpdate } from "@/api/chatsocket"
import ChatSocket from "@/api/chatsocket"
import { createChatRoom, login } from "@/api/user"
import type ChatRoom from "@/models/chatroom"
import type Message from "@/models/message"
import type User from "@/models/user"
import { defineStore } from "pinia"

const WS_URL = new URL("websocket", import.meta.env.VITE_WS_BASE).href

type ChatState = {
  socket: ChatSocket | null
  connected: boolean
  error: string | null
  user: User | null
  rooms: ChatRoom[]
  messages: Record<string, Message[]>
}

export const useChatStore = defineStore("chat", {
  state: (): ChatState => ({
    connected: false,
    error: null,
    socket: null,
    user: null,
    rooms: [],
    messages: {},
  }),
  getters: {
    getMessages: (state) => (room: string) => {
      return state.messages[room] ?? []
    },
  },
  actions: {
    async loginUser(username: string) {
      const user = await login(username)
      this.socket = new ChatSocket(
        WS_URL + `?username=${username}`,
        () => {
          this.connected = true
        },
        (code: number) => {
          this.connected = false
          this.error = `Websocket closed with code ${code}`
        },
      )
      this.user = user
    },
    async getChatrooms() {
      this.rooms = await getChatrooms()
    },
    addMessage(payload: ChatUpdate) {
      const { room, user, message, messageId, timestamp } = payload
      const roomMessages = this.messages[room] ?? []
      roomMessages.push({
        id: messageId,
        sender: user,
        content: message,
        timestamp,
      })
      this.messages[room] = roomMessages
    },
    sendMessage(message: string, room: string) {
      if (this.user) {
        this.socket?.sendMessage({ user: this.user.nickname, message, room })
      } else {
        console.log("User not logged in")
      }
    },
    async createChatRoom(room: string) {
      if (this.user) {
        await createChatRoom(room, this.user.id)
        await this.getChatrooms()
      } else {
        console.log("User not logged in")
      }
    },
    async joinChatRoom(room: string) {
      if (this.user) {
        await this.socket?.joinRoom(room)
      } else {
        console.log("User not logged in")
      }
    },
  },
})
