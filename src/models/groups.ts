import { Model, Table, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import Nodes from './nodes.js';
import Users from './users.js';
import GroupPermissions from './grouppermissions.js';
import { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';

@Table({ tableName: 'groups' })
export default class Groups extends Model<
    InferAttributes<Groups>,
    InferCreationAttributes<Groups>
> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    groupId?: number;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        validate: { notEmpty: true },
        unique: true,
    })
    name!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
    })
    description!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
    })
    address!: string;

    @HasMany(() => Nodes, 'groupId')
    nodes: Nodes[];

    @BelongsToMany(() => Users, () => GroupPermissions)
    users: Array<Users & { GroupPermissions: GroupPermissions }>;
}
