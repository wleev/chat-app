import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  DataTypes,
  Association,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
} from "sequelize"

import sequelizeConnection from "../database"
import ChatRoom from "./chatroom"
import Message from "./message"

export default class User extends Model<
  InferAttributes<User, { omit: "ownedChatRooms" }>,
  InferCreationAttributes<User, { omit: "ownedChatRooms" }>
> {
  declare id: CreationOptional<number>
  declare nickname: string

  declare ownedChatRooms?: NonAttribute<ChatRoom[]>
  declare chatRooms?: NonAttribute<ChatRoom[]>
  declare messages?: NonAttribute<Message[]>

  declare createChatRoom: HasManyCreateAssociationMixin<ChatRoom>
  declare removeChatRoom: HasManyRemoveAssociationMixin<
    ChatRoom,
    ChatRoom["id"]
  >

  declare static associations: {
    ownedChatRooms: Association<User, ChatRoom>
    chatRooms: Association<User, ChatRoom>
    messages: Association<User, Message>
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    sequelize: sequelizeConnection,
  },
)
User.hasMany(ChatRoom, {
  sourceKey: "id",
  foreignKey: "creatorId",
  as: "ownedChatRooms",
})
User.belongsToMany(ChatRoom, { as: "chatRooms", through: "User_ChatRooms" })
ChatRoom.belongsToMany(User, { as: "members", through: "User_ChatRooms" })
ChatRoom.belongsTo(User, { as: "creator", foreignKey: "creatorId" })
User.hasMany(Message, { sourceKey: "id", foreignKey: "senderId" })
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" })
