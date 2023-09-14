import Hapi, { Server } from "@hapi/hapi"
import { register } from "./websocket"

export const create = async (): Promise<Server> => {
  const server = Hapi.server({
    port: process.env.PORT || 4000,
    host: "0.0.0.0",
    debug: { request: ["error"] },
    routes: {
      cors: true,
    },
  })

  server.ext({
    type: "onPostStart",
    method: (s: Server) => {
      register(s)
    },
  })

  return server
}

export const start = async (server: Server): Promise<void> => {
  return server.start()
}
