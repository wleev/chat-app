import { Server } from "@hapi/hapi"
import { IncomingMessage } from "http"
import ws from "ws"
import { getByNickname } from "../services/user"
import { editMessage, addMessage } from "../services/message"
import { getByName, joinById } from "../services/chatroom"
import User from "../models/user"

interface WSMessage {
  type: "chat" | "edit" | "join"
  payload: ChatMessage | EditMessage | string
}

interface ChatMessage {
  room: string
  user: string
  message: string
}

interface EditMessage extends ChatMessage {
  messageId: string
}

interface ChatUpdate extends EditMessage {
  timestamp: Date
}

class Connection {
  public rooms: string[]
  public ws: ws.WebSocket

  constructor(rooms: string[], ws: ws.WebSocket) {
    this.rooms = rooms
    this.ws = ws
  }
}

const connections: Map<string, Connection> = new Map()

export function register(server: Server) {
  const wss: ws.Server = new ws.Server({
    server: server.listener,
  })
  wss.on("connection", async (ws: ws.WebSocket, request: IncomingMessage) => {
    const url = new URL(request.url ?? "", `http://${request.headers.host}`)
    const username = url.searchParams.get("username")
    if (username) {
      const user = await initializeConnection(ws, username)
      if (user) {
        if (url.pathname.endsWith("/websocket")) {
          ws.on("message", (message: string) => {
            processMessage(ws, user, message)
          })
        }
      }
    }
  })
}

async function processMessage(
  ws: ws.WebSocket,
  user: User,
  raw: string,
): Promise<void> {
  const message: WSMessage = JSON.parse(raw)
  if (message.type === "chat") {
    await processChatMessage(message.payload as ChatMessage)
  } else if (message.type === "edit") {
    await ProcessEditMessage(message.payload as EditMessage)
  } else if (message.type === "join") {
    await ProcessJoinMessage(user, message.payload as string)
  }
}

async function initializeConnection(
  ws: ws.WebSocket,
  username: string,
): Promise<User | null> {
  if (connections.has(username)) {
    ws.close(4400, "User already connected")
    return null
  }
  const user = await getByNickname(username)
  if (!user) {
    ws.close(4404, "User not found")
    return null
  } else {
    const rooms = user.chatRooms?.map((room) => room.name)
    connections.set(user.nickname, new Connection(rooms ?? [], ws))
    return user
  }
}

async function processChatMessage(incoming: ChatMessage): Promise<string> {
  const { room, user, message: content } = incoming

  const message = await addMessage(user, room, content)
  const chatroom = await getByName(room)
  if (!chatroom) {
    return "Error: Chat room not found"
  }
  const members = chatroom.members?.map((member) => member.nickname)
  if (!members) {
    return "Error: Chat room members not found"
  }

  for (const member of members) {
    const connection = connections.get(member)
    if (connection) {
      const update: ChatUpdate = {
        room,
        user,
        message: content,
        messageId: message.id,
        timestamp: message.timestamp,
      }
      connection.ws.send(
        JSON.stringify({
          type: "update",
          payload: update,
        }),
      )
    }
  }
  return ""
}

async function ProcessEditMessage(incoming: EditMessage): Promise<string> {
  const { room, user, message: content, messageId } = incoming

  const message = await editMessage(user, room, messageId, content)
  const chatroom = await getByName(room)
  if (!chatroom) {
    return "Error: Chat room not found"
  }
  const members = chatroom.members?.map((member) => member.nickname)
  if (!members) {
    return "Error: Chat room members not found"
  }

  for (const member of members) {
    const connection = connections.get(member)
    if (connection) {
      const update: ChatUpdate = {
        room,
        user,
        message: content,
        messageId: message.id,
        timestamp: message.timestamp,
      }
      connection.ws.send(
        JSON.stringify({
          type: "update",
          payload: update,
        }),
      )
    }
  }
  return ""
}

async function ProcessJoinMessage(user: User, room: string) {
  const connection = connections.get(user.nickname)
  if (!connection) {
    return
  }
  if (!connection.rooms.includes(room)) {
    connection.rooms.push(room)
  }

  const chatroom = await getByName(room)
  if (!chatroom) {
    return
  }

  if (!chatroom.members?.find((member) => member.id === user.id)) {
    await joinById(chatroom.id, user.id)
  }
}
