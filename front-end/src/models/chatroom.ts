import type User from "./user"

export default interface ChatRoom {
  id: number
  name: string
  creatorId: number
  creator: User
  members: User[]
}
