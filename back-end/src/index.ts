import { create, start } from "./server"

create().then(async (server) => start(server))
