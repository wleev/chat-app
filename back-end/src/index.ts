import { create, start } from "./server"
import registerRoutes from "./routes"
import dbConnection from "./database"

create().then(async (server) => {
  console.log("Configuring server...")
  console.log("Connecting to database...")
  try {
    await dbConnection.authenticate()
    console.log("Database connected!")
    await dbConnection.sync()
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
  console.log("Registering routes...")
  registerRoutes(server)
  console.log("Routes registered!")
  console.log("Starting server...")
  start(server)
})
