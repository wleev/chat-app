import ChatRoom from "../models/chatroom"
import User from "../models/user"

export const getAll = async (): Promise<ChatRoom[]> => {
  const rooms = await ChatRoom.findAll({
    include: [
      { model: User, as: "members", through: { attributes: [] } },
      "creator",
    ],
  })
  return rooms
}

export const getById = async (id: number): Promise<ChatRoom | null> => {
  return await ChatRoom.findOne({ where: { id } })
}

export const getJoinedByUserId = async (
  userId: number,
): Promise<ChatRoom[]> => {
  const rooms = await ChatRoom.findAll({
    include: [
      {
        association: "members",
        where: { id: userId },
      },
    ],
  })
  return rooms
}

export const isOwnedByUserId = async (
  userId: number,
  roomId: number,
): Promise<ChatRoom | null> => {
  return await ChatRoom.findOne({ where: { id: roomId, creatorId: userId } })
}

export const joinById = async (
  roomId: number,
  userId: number,
): Promise<void> => {
  const room = await getById(roomId)
  if (!room) {
    throw new Error("Room not found")
  }
  await room.addMember(userId)
}

export const leaveById = async (roomId: number, userId: number) => {
  const room = await getById(roomId)
  if (!room) {
    throw new Error("Room not found")
  }
  await room.removeMember(userId)
}

export const deleteById = async (id: number): Promise<number> => {
  return await ChatRoom.destroy({ where: { id } })
}
