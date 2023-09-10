import { Server } from "@hapi/hapi"
import { IncomingMessage } from "http"
import ws from "ws"
import { getByNickname } from "../services/user"
import { editMessage, addMessage } from "../services/message"
import { getByName } from "../services/chatroom"

interface WSMessage {
  type: "handshake" | "chat" | "edit" | "update"
  payload: HandshakeMessage | ChatMessage | EditMessage
}

interface HandshakeMessage {
  username: string
}

interface ChatMessage {
  room: string
  user: string
  message: string
}

interface EditMessage extends ChatMessage {
  messageId: number
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
  wss.on("connection", (ws: ws.WebSocket, request: IncomingMessage) => {
    if (request.url?.endsWith("/websocket")) {
      ws.on("message", (message: string) => {
        processMessage(ws, message)
      })
    }
  })
}

async function processMessage(ws: ws.WebSocket, raw: string): Promise<void> {
  const message: WSMessage = JSON.parse(raw)
  if (message.type === "handshake") {
    await processHandshakeMessage(ws, message.payload as HandshakeMessage)
  } else if (message.type === "chat") {
    await processChatMessage(message.payload as ChatMessage)
  } else if (message.type === "edit") {
    await ProcessEditMessage(message.payload as EditMessage)
  }
}

async function processHandshakeMessage(
  ws: ws.WebSocket,
  message: HandshakeMessage,
): Promise<void> {
  const { username } = message
  if (connections.has(username)) {
    ws.send("Error: User already connected!")
    ws.close()
  }
  const user = await getByNickname(username)
  if (!user) {
    ws.send("Error: User not found!")
    ws.close()
  } else {
    const rooms = user.chatRooms?.map((room) => room.name)
    connections.set(user.nickname, new Connection(rooms ?? [], ws))
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
      connection.ws.send(
        JSON.stringify({
          type: "update",
          payload: {
            room,
            user,
            message: content,
            messageId: message.id,
            timestamp: message.timestamp,
          },
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
      connection.ws.send(
        JSON.stringify({
          type: "update",
          payload: {
            room,
            user,
            message: content,
            messageId: message.id,
            timestamp: message.timestamp,
          },
        }),
      )
    }
  }
  return ""
}
