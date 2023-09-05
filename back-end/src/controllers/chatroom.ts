import { Request, ResponseToolkit } from "@hapi/hapi"
import * as ChatRoomService from "../services/chatroom"

export default class ChatRoomController {
  public async getAll(request: Request, h: ResponseToolkit) {
    const rooms = await ChatRoomService.getAll()
    return h.response(rooms).code(200)
  }
}
