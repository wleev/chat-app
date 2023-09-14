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
