import { Request, ResponseToolkit } from "@hapi/hapi"
import * as ChatRoomService from "../services/chatroom"

export default class ChatRoomController {
  public async getAll(request: Request, h: ResponseToolkit) {
    const rooms = await ChatRoomService.getAll()
    return h.response(rooms).code(200)
  }

  public async createChatRoom(request: Request, h: ResponseToolkit) {
    const { name, userId } = request.payload as {
      name: string
      userId: number
    }
    const room = await ChatRoomService.createChatRoom(name, userId)
    return h.response(room).code(201)
  }
}
