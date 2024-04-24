import { Model, Table, Column, DataType, HasMany, BelongsToMany } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import Activities from "./activities.js";
import GroupPermissions from "./grouppermissions.js";
import Groups from "./groups.js";

@Table({ tableName: "users" })

export default class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    userId?: number;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        validate: { notEmpty: true }
    })
    name!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(15),
        validate: { isNumeric: true, notEmpty: true }
    })
    phone!: string;

    @Column({
        allowNull: false,
        type: DataType.ENUM('admin', 'user'),
        defaultValue: 'user'
    })
    role!: string;

    @Column({
        allowNull: true,
        type: DataType.STRING(30),
    })
    description?: string;

    @Column({
        allowNull: true,
        type: DataType.BLOB,
    })
    profilePicture?: Uint8Array;

    @Column({
        type: DataType.STRING(35),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, isEmail: true }
    })
    email!: string;

    @Column({
        type: DataType.STRING(60),
        allowNull: false,
        validate: { notEmpty: true, }
    })
    password!: string;

    @HasMany(() => Activities, 'userId')
    activities?: Activities[]

    @BelongsToMany(() => Groups, () => GroupPermissions)
    groups?: Array<Groups & { GroupPermissions: GroupPermissions }>;
}