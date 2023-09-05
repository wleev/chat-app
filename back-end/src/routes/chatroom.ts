import { Request, ResponseToolkit, Server } from "@hapi/hapi"
import ChatRoomController from "../controllers/chatroom"

function register(server: Server) {
  const chatRoomController = new ChatRoomController()

  server.route({
    method: "GET",
    path: "/chatroom/all",
    handler: (req: Request, h: ResponseToolkit) => {
      return chatRoomController.getAll(req, h)
    },
  })
}

export default register
