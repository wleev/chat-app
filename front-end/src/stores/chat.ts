import { createChatRoom, getChatrooms } from "@/api/chatroom"
import ChatSocket from "@/api/chatsocket"
import { getMessages } from "@/api/messages"
import { login } from "@/api/user"
import type ChatRoom from "@/models/chatroom"
import type Message from "@/models/message"
import type User from "@/models/user"
import type { ChatUpdate, RoomsUpdate, StatusUpdate } from "@/types/chatsocket"
import { defineStore } from "pinia"

const WS_URL = new URL(
  "websocket",
  import.meta.env.VITE_WS_BASE || (window as any).env.WS_URL,
).href

type ChatState = {
  socket: ChatSocket | null
  connected: boolean
  error: string | null
  user: User | null
  rooms: ChatRoom[]
  selectedRoom: ChatRoom | null
  messages: Record<string, Message[]>
}

export const useChatStore = defineStore("chat", {
  state: (): ChatState => ({
    connected: false,
    error: null,
    socket: null,
    user: null,
    rooms: [],
    selectedRoom: null,
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
      const msgIdx = roomMessages.findIndex((m) => m.id === messageId)
      if (msgIdx > -1) {
        roomMessages[msgIdx].content = message
        return
      } else {
        roomMessages.push({
          id: messageId,
          sender: user,
          content: message,
          timestamp,
        })
      }
      this.messages[room] = roomMessages
    },
    updateRooms(payload: RoomsUpdate) {
      payload.updatedRooms.forEach((room) => {
        const roomToUpdate = this.rooms.find((r) => r.name === room.room)
        if (roomToUpdate) {
          roomToUpdate.members = room.members
        }
      })
    },
    updateStatus(payload: StatusUpdate) {
      console.log("status update", payload)
      payload.rooms.forEach((room) => {
        const roomToUpdate = this.rooms.find((r) => r.name === room)
        if (roomToUpdate) {
          const member = roomToUpdate.members.find(
            (m) => m.nickname === payload.nickname,
          )
          if (member) {
            console.log("setting member", member)
            console.log("setting online", payload.online)
            member.online = payload.online
          }
        }
      })
    },
    sendMessage(message: string, room: string) {
      if (this.user) {
        this.socket?.sendMessage({ user: this.user.nickname, message, room })
      } else {
        console.log("User not logged in")
      }
    },
    editMessage(message: string, messageId: string, room: string) {
      if (this.user) {
        this.socket?.editMessage({
          user: this.user.nickname,
          message: message,
          messageId: messageId,
          room: room,
        })
        this.messages[room].find((m) => m.id === messageId)!.content = message
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
    async joinChatRoom(room: ChatRoom) {
      if (this.user) {
        const messages = await getMessages({
          chatRoomId: room.id,
          page: 0,
          pageSize: 50,
        })
        this.messages[room.name] = messages.reverse()
        await this.socket?.joinRoom(room.name)
      } else {
        console.log("User not logged in")
      }
    },
  },
})
