import { Model, Table, Column, DataType, ForeignKey, CreatedAt } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import Users from "./users.js";
import Groups from "./groups.js";

@Table({ tableName: "grouppermissions" })

export default class GroupPermissions extends Model<InferAttributes<GroupPermissions>, InferCreationAttributes<GroupPermissions>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER
    })
    groupPermissionId?: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId!: number;

    @ForeignKey(() => Groups)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    groupId!: number;

    @Column({
        type: DataType.ENUM('manager', 'member', 'guest'),
        allowNull: false,
        defaultValue: 'member',
        validate: { notEmpty: true }
    })
    permission!: string;

    @Column({
        allowNull: true,
        type: DataType.DATE,
    })
    joinedAt?: Date;

    @Column({
        type: DataType.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        validate: { notEmpty: true },
        defaultValue: 'pending'
    })
    requestStatus!: string;

    @CreatedAt
    requestJoinAt!: Date;
}