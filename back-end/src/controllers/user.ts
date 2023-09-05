import { Request, ResponseToolkit } from "@hapi/hapi"
import * as UserService from "../services/user"

export default class UserController {
  public async findOrCreate(request: Request, h: ResponseToolkit) {
    const { nickname } = request.payload as { nickname: string }
    const user = await UserService.getByNickname(nickname)
    if (user) {
      return h.response(user).code(200)
    }
    const newUser = await UserService.create(nickname)
    return h.response(newUser).code(201)
  }

  public async createChatRoom(request: Request, h: ResponseToolkit) {
    const { roomName, userId } = request.payload as {
      roomName: string
      userId: number
    }
    const room = await UserService.createChatRoom(roomName, userId)
    return h.response(room).code(201)
  }
}
