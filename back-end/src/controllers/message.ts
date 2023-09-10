import { Request, ResponseToolkit } from "@hapi/hapi"
import { getByChatRoomId } from "../services/message"

interface ChatRoomMessageRequest {
  chatRoomId: number
  page: number
  pageSize: number
}

export default class MessageController {
  public async getByChatRoomId(request: Request, h: ResponseToolkit) {
    const { chatRoomId, page, pageSize } =
      request.payload as ChatRoomMessageRequest

    if (page < 0 || pageSize < 0) {
      return h.response("Error: Invalid page or page size").code(400)
    }
    const messages = await getByChatRoomId(chatRoomId, page, pageSize)
    return h.response(messages).code(200)
  }
}
