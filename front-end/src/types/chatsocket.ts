export enum WSOutgoingType {
  Chat = "chat",
  Edit = "edit",
  Join = "join",
}

export enum WSIncomingType {
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

export type WSOutgoingPayload = {
  [WSOutgoingType.Chat]: ChatMessage
  [WSOutgoingType.Edit]: EditMessage
  [WSOutgoingType.Join]: string
}

export interface WSOutgoingMessage<T extends WSOutgoingType> {
  type: T
  payload: WSOutgoingPayload[T]
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

export type WSIncomingPayload = {
  [WSIncomingType.Update]: ChatUpdate
  [WSIncomingType.RoomsUpdate]: RoomsUpdate
  [WSIncomingType.StatusUpdate]: StatusUpdate
}

export interface WSIncomingMessage<T extends WSIncomingType> {
  type: T
  payload: WSIncomingPayload[T]
}
