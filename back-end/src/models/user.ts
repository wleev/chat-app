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

export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>
  declare nickname: string

  declare ownedChatRooms?: NonAttribute<ChatRoom[]>
  declare chatRooms?: NonAttribute<ChatRoom[]>

  declare createChatRoom: HasManyCreateAssociationMixin<ChatRoom>
  declare removeChatRoom: HasManyRemoveAssociationMixin<
    ChatRoom,
    ChatRoom["id"]
  >

  declare static associations: {
    ownedChatRooms: Association<User, ChatRoom>
    chatRooms: Association<User, ChatRoom>
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
  foreignKey: "creatorId",
})
User.belongsToMany(ChatRoom, { as: "chatRooms", through: "User_ChatRooms" })
ChatRoom.belongsToMany(User, { as: "members", through: "User_ChatRooms" })
ChatRoom.belongsTo(User, { as: "creator", foreignKey: "creatorId" })
