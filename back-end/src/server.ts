import Hapi, { Server } from "@hapi/hapi"

export const create = async (): Promise<Server> => {
  const server = Hapi.server({
    port: process.env.PORT || 4000,
    host: "0.0.0.0",
  })

  server.route({
    method: "GET",
    path: "/",
    handler: () => {
      return "Hellodasf, world!"
    },
  })

  return server
}

export const start = async (server: Server): Promise<void> => {
  return server.start()
}
