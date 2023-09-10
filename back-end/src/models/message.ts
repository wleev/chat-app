import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"
import User from "./user"
import ChatRoom from "./chatroom"
import sequelizeConnection from "../database"

export default class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<string>
  declare content: string
  declare senderId: ForeignKey<User["id"]>
  declare chatRoomId: ForeignKey<ChatRoom["id"]>
  declare timestamp: Date
  declare edited: CreationOptional<boolean>

  declare sender: NonAttribute<User>
  declare chatRoom: NonAttribute<ChatRoom>

  declare static associations: {
    sender: Association<Message, User>
    chatRoom: Association<Message, ChatRoom>
  }
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "messages",
    sequelize: sequelizeConnection,
  },
)
