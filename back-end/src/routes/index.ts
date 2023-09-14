import { Server } from "@hapi/hapi"
import registerUserRoutes from "./user"
import registerChatRoomRoutes from "./chatroom"
import registerMessageRoutes from "./message"

function register(server: Server) {
  registerUserRoutes(server)
  registerChatRoomRoutes(server)
  registerMessageRoutes(server)
}

export default register
