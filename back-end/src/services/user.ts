import User from "../models/user"

export const create = async (nickname: string): Promise<User> => {
  const user = await User.create({ nickname })
  return user
}

export const getByNickname = async (nickname: string): Promise<User | null> => {
  const user = await User.findOne({
    where: { nickname },
    include: ["chatRooms", "ownedChatRooms"],
  })
  return user
}

export const createChatRoom = async (roomName: string, userId: number) => {
  const user = await User.findOne({ where: { id: userId } })
  if (!user) {
    throw new Error("User not found")
  }
  const room = await user.createChatRoom({ name: roomName, creatorId: userId })
  await room.addMember(user)
  return room
}
