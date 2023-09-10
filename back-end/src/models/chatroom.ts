import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  DataTypes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  Association,
} from "sequelize"

import sequelizeConnection from "../database"
import User from "./user"

export default class ChatRoom extends Model<
  InferAttributes<ChatRoom>,
  InferCreationAttributes<ChatRoom>
> {
  declare id: CreationOptional<number>
  declare name: string

  declare creatorId: ForeignKey<User["id"]>
  declare creator: NonAttribute<User>

  declare members: NonAttribute<User[]>
  declare addMember: BelongsToManyAddAssociationMixin<User, number>
  declare removeMember: BelongsToManyRemoveAssociationMixin<User, number>

  declare static associations: {
    creator: Association<ChatRoom, User>
    members: Association<ChatRoom, User>
  }
}

ChatRoom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "chatrooms",
    sequelize: sequelizeConnection,
  },
)
