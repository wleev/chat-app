import { useChatStore } from "@/stores/chat"
import {
  type ChatMessage,
  type ChatUpdate,
  type WSIncomingMessage,
  WSIncomingType,
  type RoomsUpdate,
  type StatusUpdate,
  type WSOutgoingMessage,
  WSOutgoingType,
  type EditMessage,
} from "@/types/chatsocket"

export default class ChatSocket {
  private _socket: WebSocket
  private _closeHandler: (code: number) => void
  private _openHandler: () => void
  private _chatStore: ReturnType<typeof useChatStore>

  constructor(
    url: string,
    onOpen: () => void,
    onClose: (code: number) => void,
  ) {
    this._chatStore = useChatStore()
    this._socket = new WebSocket(url)
    this._closeHandler = onClose
    this._openHandler = onOpen
    this._socket.onerror = this.errorHandler.bind(this)
    this._socket.onclose = this.closeHandler.bind(this)
    this._socket.onopen = this.openHandler.bind(this)
    this._socket.onmessage = this.messageHandler.bind(this)
  }

  private messageHandler(event: MessageEvent): any {
    console.log("CHATSOCKET -- Websocket message received. ", event)
    const message: WSIncomingMessage<WSIncomingType> = JSON.parse(event.data)

    switch (message.type) {
      case WSIncomingType.Update:
        this._chatStore.addMessage(message.payload as ChatUpdate)
        break
      case WSIncomingType.RoomsUpdate:
        this._chatStore.updateRooms(message.payload as RoomsUpdate)
        break
      case WSIncomingType.StatusUpdate:
        this._chatStore.updateStatus(message.payload as StatusUpdate)
        break
      default:
        console.log("CHATSOCKET -- Unknown message type. ", message)
    }
  }

  public sendMessage(message: ChatMessage) {
    const wrapped: WSOutgoingMessage<WSOutgoingType.Chat> = {
      type: WSOutgoingType.Chat,
      payload: message,
    }

    this._socket.send(JSON.stringify(wrapped))
  }

  public editMessage(message: EditMessage) {
    const wrapped: WSOutgoingMessage<WSOutgoingType.Edit> = {
      type: WSOutgoingType.Edit,
      payload: message,
    }

    this._socket.send(JSON.stringify(wrapped))
  }

  public joinRoom(room: string) {
    const wrapped: WSOutgoingMessage<WSOutgoingType.Join> = {
      type: WSOutgoingType.Join,
      payload: room,
    }
    this._socket.send(JSON.stringify(wrapped))
  }

  private openHandler(): any {
    this._openHandler()
  }

  private errorHandler(event: Event): any {
    console.log("CHATSOCKET -- Websocket error. ", event)
  }

  private closeHandler(event: CloseEvent): any {
    console.log("CHATSOCKET -- Websocket closing. ", event)
    this._closeHandler(event.code)
  }

  public close(): void {
    console.log("CHATSOCKET -- Closing websocket")
    this._socket.onmessage = null
    this._socket.close()
    this._socket == null
  }
}
