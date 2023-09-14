import { Server } from "@hapi/hapi"
import { IncomingMessage } from "http"
import ws, { on } from "ws"
import { getByNickname } from "../services/user"
import { editMessage, addMessage } from "../services/message"
import { getByName, joinById } from "../services/chatroom"
import User from "../models/user"
import Message from "../models/message"
import {
  ChatMessage,
  Connection,
  EditMessage,
  WSIncomingMessage,
  WSIncomingType,
  WSOutgoingMessage,
  WSOutgoingType,
} from "./types"

const connections: Map<string, Connection> = new Map()

export function register(server: Server) {
  const wss: ws.Server = new ws.Server({
    server: server.listener,
  })
  wss.on("connection", async (ws: ws.WebSocket, request: IncomingMessage) => {
    const url = new URL(request.url ?? "", `http://${request.headers.host}`)
    if (url.pathname.endsWith("/websocket")) {
      const username = url.searchParams.get("username")
      if (username) {
        const user = await initializeConnection(ws, username)
        if (user) {
          const userRooms = user.chatRooms?.map((room) => room.name)
          sendStatusUpdate(user, true, userRooms ?? [])
          ws.on("message", (message: string) => {
            processMessage(ws, user, message)
          })
          ws.on("close", () => {
            onDisconnect(user)
          })
        }
      }
    }
  })
}

async function onDisconnect(user: User): Promise<void> {
  const connection = connections.get(user.nickname)
  if (!connection) {
    return
  }

  const roomsToUpdate = connection.rooms
  connections.delete(user.nickname)

  console.log("user disconencted:", user)

  sendStatusUpdate(user, false, roomsToUpdate)
}

async function processMessage(
  ws: ws.WebSocket,
  user: User,
  raw: string,
): Promise<void> {
  const message: WSIncomingMessage<WSIncomingType> = JSON.parse(raw)

  if (message.type === WSIncomingType.Chat) {
    await processChatMessage(message.payload as ChatMessage)
  } else if (message.type === WSIncomingType.Edit) {
    await processEditMessage(message.payload as EditMessage)
  } else if (message.type === WSIncomingType.Join) {
    await processJoinMessage(user, message.payload as string)
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

async function processChatMessage(incoming: ChatMessage): Promise<void> {
  const { room, user, message: content } = incoming

  const message = await addMessage(user, room, content)

  await sendUpdateMessage(user, room, message)
}

async function processEditMessage(incoming: EditMessage): Promise<void> {
  const { room, user, message: content, messageId } = incoming
  console.log("incoming", incoming)
  const messageToEdit = await editMessage(user, room, messageId, content)
  const chatroom = await getByName(incoming.room)
  if (!chatroom) {
    console.log("Error: Chat room not found")
    return
  }
  const members = chatroom.members?.map((member) => member.nickname)
  if (!members) {
    console.log("Error: Chat room members not found")
    return
  }

  await sendUpdateMessage(incoming.user, incoming.room, messageToEdit)
}

async function processJoinMessage(user: User, room: string): Promise<void> {
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

  const members = chatroom.members?.map((member) => member.nickname)
  if (!members) {
    return
  }

  const membersWithStatus = chatroom.members?.map((member) => {
    return {
      id: member.id,
      nickname: member.nickname,
      online: connections.has(member.nickname),
    }
  })

  const roomsMessage: WSOutgoingMessage<WSOutgoingType.RoomsUpdate> = {
    type: WSOutgoingType.RoomsUpdate,
    payload: {
      updatedRooms: [
        {
          room,
          members: membersWithStatus,
        },
      ],
    },
  }

  for (const member of members) {
    const connection = connections.get(member)
    if (connection) {
      sendOutgoingMessage(connection.ws, roomsMessage)
    }
  }
}

async function sendUpdateMessage(
  user: string,
  room: string,
  message: Message,
): Promise<void> {
  const chatroom = await getByName(room)
  if (!chatroom) {
    console.log("Error: Chat room not found", room)
    return
  }
  const members = chatroom.members?.map((member) => member.nickname)
  if (!members) {
    console.log("Error: Chat room members not found", room)
    return
  }

  const chatMessage: WSOutgoingMessage<WSOutgoingType.Update> = {
    type: WSOutgoingType.Update,
    payload: {
      room,
      user,
      message: message.content,
      messageId: message.id,
      timestamp: message.timestamp,
    },
  }

  for (const member of members) {
    const connection = connections.get(member)
    if (connection) {
      sendOutgoingMessage(connection.ws, chatMessage)
    }
  }
}

async function sendStatusUpdate(
  user: User,
  online: boolean,
  roomsToUpdate: string[],
) {
  const updateMessage: WSOutgoingMessage<WSOutgoingType.StatusUpdate> = {
    type: WSOutgoingType.StatusUpdate,
    payload: {
      nickname: user.nickname,
      rooms: roomsToUpdate,
      online,
    },
  }

  console.log("roomstoUpdate", roomsToUpdate)

  const usersNeedingUpdate: string[] = []
  connections.forEach((connection: Connection, nickname: string) => {
    console.log("connection rooms", connection.rooms)
    console.log("nickname", nickname)
    if (
      connection.rooms.some((room) => {
        return roomsToUpdate.includes(room)
      })
    )
      usersNeedingUpdate.push(nickname)
  })
  console.log("usersNeedingUpdate", usersNeedingUpdate)
  for (const member of usersNeedingUpdate) {
    const connection = connections.get(member)
    if (connection) {
      sendOutgoingMessage(connection.ws, updateMessage)
    }
  }
}

async function sendOutgoingMessage<T extends WSOutgoingType>(
  ws: ws.WebSocket,
  message: WSOutgoingMessage<T>,
) {
  ws.send(JSON.stringify(message))
}
