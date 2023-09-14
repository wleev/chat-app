import { Request, ResponseToolkit } from "@hapi/hapi"
import * as UserService from "../services/user"

export default class UserController {
  public async findOrCreate(request: Request, h: ResponseToolkit) {
    const { username } = request.payload as { username: string }
    console.log("username", username)
    const user = await UserService.getByNickname(username)
    if (user) {
      return h.response(user).code(200)
    }
    const newUser = await UserService.create(username)
    return h.response(newUser).code(201)
  }
}
