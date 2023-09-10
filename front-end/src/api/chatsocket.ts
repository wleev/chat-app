import { useChatStore } from "@/stores/chat"

interface WSMessage {
  type: "chat" | "edit" | "update"
  payload: ChatMessage | EditMessage | ChatUpdate
}

interface ChatMessage {
  room: string
  user: string
  message: string
}

interface EditMessage extends ChatMessage {
  messageId: string
}

export interface ChatUpdate extends EditMessage {
  timestamp: Date
}

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
    const message: WSMessage = JSON.parse(event.data)

    if (message.type === "update") {
      this._chatStore.addMessage(message.payload)
    }
  }

  public sendMessage(message: ChatMessage) {
    const wrapped = {
      type: "chat",
      payload: message,
    }
    this._socket.send(JSON.stringify(wrapped))
  }

  public joinRoom(room: string) {
    const wrapped = {
      type: "join",
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
