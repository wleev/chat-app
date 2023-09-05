import { Server } from "@hapi/hapi"
import registerUserRoutes from "./user"
import registerChatRoomRoutes from "./chatroom"

function register(server: Server) {
  registerUserRoutes(server)
  registerChatRoomRoutes(server)
}

export default register
