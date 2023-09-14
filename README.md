# Chat Application

## Overview

This is a simple chat server featuring both a back and front-end. The back-end is based of the Hapi server framework and uses Sequelize for database ORM. The front-end is a Vue application. Both are written using Typescript.

## Features

- **Chat Rooms**: Users can join chat rooms dynamically.
- **Real-Time Messaging**: Users can send and receive messages in real-time.
- **Message Editing**: Users have limited message editing capabilities.
- **Connection Status**: Ability to view the connection status of other users in the same chat room.

## Project Structure

The project code base consists of two main folders for the back- and front-end, aptly named `back-end` and `front-end`.

The back-end code is structured like:

```plaintext
src/
├── index.ts            # Entry point of your application
├── server.ts           # Hapi server setup
├── database.ts         # Sequelize database setup
├── websocket/          
│   ├── index.ts        # WebSocket server setup and handlers
│   └── types.ts        # Incoming and outgoing types for WebSocket messages
├── routes/             # All the routes are specified here and given to their approriate controllers
├── controllers/        # Business logic for the REST API is handled here
└── models/             # The Sequelize database models are specified here
```

The front-end is structured like:

```plaintext
src/
├── main.ts             # Entry point of your application
├── App.vue             # The root component
├── api/          
│   ├── chatsocket.ts   # WebSocket client setup and handlers
│   └── ...             # Functions that consume the back-end REST API
├── models/             # Models used by store and display logic
├── store/              # The main store is defined here, persisting (in-memory) and handling out and incoming data
└── types/              # Types for websocket communication ( similar to back-end )
```

## Technologies Used

- **TypeScript**: Ensures type safety and helps in maintaining a robust codebase.
- **Hapi**: A server framework based on NodeJS helping to setup easy routing and WS communication.
- **WebSocket**: Enables real-time, full-duplex communication between the client and server.
- **Vue**: A modern front-end framework for quick prototype development
- **Sequelize**: A powerful ORM for Node.js
- **Docker**: Virtualizaton software to help use create easily packaged and runnable software
- **eslint/prettier**: linting frameworks for keeping code style consistent and to apply best practices everywhere

## Getting Started

### Docker

To build and run the Docker containers, `docker-compose` is best used:

```sh
docker-compose up
```

Access the application at [http://localhost:8000](http://localhost:8000) ( these are the default settings).

#### Docker configuration

The `docker-compose.yaml` contains all the runtime parameters necessary to run this package of software ( db, back-end, front-end ).
Some parameters that can be changed in the `docker-compose` file:
    - Port mapping for the back-end, default set to `4000:4000`
    - If the back-end port is changed, the front-end settings will need to be adjusted accordingly: `CHAT_API_URL` and `CHAT_WS_URL`
    - Port mapping for the front-end can also be changed, default set to `8000:80`

## Testing

Testing frameworks were considered, but no tests are implemented as of yet.

## Future improvements and current issues

There are many limitations at the moment and much to be improved on:

- Completely rewrite the current chat UI using component based approach. Allows for easy testing and modifications.
- Currently there's no scaling possible for the back-end server. Decoupling the database and having an intermediary key-value store will allow for multiple synchronized servers working in sync.
- Testing will allow for more robust and issue-less development. Integration tests on the back-end and e2e testing on the front-end. 
- UI improvements in general ( eg styling )

These are just some sample improvements. In the end this is a quickly written prototype of a live text-based chat. Comprimises needed to be made and the delivery of an MVP was prioritized.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (not implemented yet).
