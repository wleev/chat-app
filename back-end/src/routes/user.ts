import { Request, ResponseToolkit, Server } from "@hapi/hapi"
import UserController from "../controllers/user"

function register(server: Server) {
  const userController = new UserController()

  server.route({
    method: "POST",
    path: "/user/login",
    handler: (req: Request, h: ResponseToolkit) => {
      return userController.findOrCreate(req, h)
    },
  })
}

export default register
