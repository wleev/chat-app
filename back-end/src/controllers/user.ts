import { Request, ResponseToolkit } from "@hapi/hapi"
import * as UserService from "../services/user"

export default class UserController {
  public async findOrCreate(request: Request, h: ResponseToolkit) {
    const { username } = JSON.parse(request.payload as string) as {
      username: string
    }
    console.log("username", username)
    const user = await UserService.getByNickname(username)
    if (user) {
      return h.response(user).code(200)
    }
    const newUser = await UserService.create(username)
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
