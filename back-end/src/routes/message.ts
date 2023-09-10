import { Request, ResponseToolkit, Server } from "@hapi/hapi"
import MessageController from "../controllers/message"

function register(server: Server) {
  const messageController = new MessageController()

  server.route({
    method: "POST",
    path: "/messages/by-chatroom",
    handler: (req: Request, h: ResponseToolkit) => {
      return messageController.getByChatRoomId(req, h)
    },
  })
}

export default register
