import ws from "ws"

export class Connection {
  public rooms: string[]
  public ws: ws.WebSocket

  constructor(rooms: string[], ws: ws.WebSocket) {
    this.rooms = rooms
    this.ws = ws
  }
}

export enum WSIncomingType {
  Chat = "chat",
  Edit = "edit",
  Join = "join",
}

export enum WSOutgoingType {
  Update = "update",
  RoomsUpdate = "rooms-update",
  StatusUpdate = "status-update",
}

export interface ChatMessage {
  room: string
  user: string
  message: string
}

export interface EditMessage extends ChatMessage {
  messageId: string
}

export type WSIncomingPayload = {
  [WSIncomingType.Chat]: ChatMessage
  [WSIncomingType.Edit]: EditMessage
  [WSIncomingType.Join]: string
}

export interface WSIncomingMessage<T extends WSIncomingType> {
  type: T
  payload: WSIncomingPayload[T]
}

export interface ChatUpdate extends EditMessage {
  timestamp: Date
}

export interface RoomsUpdate {
  updatedRooms: Array<{
    room: string
    members: Array<{
      id: number
      nickname: string
      online: boolean
    }>
  }>
}

export interface StatusUpdate {
  nickname: string
  rooms: string[]
  online: boolean
}

export type WSOutgoingPayload = {
  [WSOutgoingType.Update]: ChatUpdate
  [WSOutgoingType.RoomsUpdate]: RoomsUpdate
  [WSOutgoingType.StatusUpdate]: StatusUpdate
}

export interface WSOutgoingMessage<T extends WSOutgoingType> {
  type: T
  payload: WSOutgoingPayload[T]
}
