import { Model, Table, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import Nodes from './nodes.js';
import Users from './users.js';
import GroupPermissions from './grouppermissions.js';
import {
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyHasAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';

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

    declare membersCount: number;
    declare memberRequestsCount: number;
    declare nodesCount: number;

    declare getUsers: BelongsToManyGetAssociationsMixin<Users>;
    declare addUser: BelongsToManyAddAssociationMixin<Users, number>;
    declare addUsers: BelongsToManyAddAssociationsMixin<Users, number>;
    declare setUsers: BelongsToManySetAssociationsMixin<Users, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<Users, number>;
    declare removeUsers: BelongsToManyRemoveAssociationsMixin<Users, number>;
    declare hasUser: BelongsToManyHasAssociationMixin<Users, number>;
    declare hasUsers: BelongsToManyHasAssociationsMixin<Users, number>;
    declare countUsers: BelongsToManyCountAssociationsMixin;
    declare createUser: BelongsToManyCreateAssociationMixin<Users>;

    declare getNodes: HasManyGetAssociationsMixin<Nodes>;
    declare addNode: HasManyAddAssociationMixin<Nodes, number>;
    declare addNodes: HasManyAddAssociationsMixin<Nodes, number>;
    declare setNodes: HasManySetAssociationsMixin<Nodes, number>;
    declare removeNode: HasManyRemoveAssociationMixin<Nodes, number>;
    declare removeNodes: HasManyRemoveAssociationsMixin<Nodes, number>;
    declare hasNode: HasManyHasAssociationMixin<Nodes, number>;
    declare hasNodes: HasManyHasAssociationsMixin<Nodes, number>;
    declare countNodes: HasManyCountAssociationsMixin;
    declare createNode: HasManyCreateAssociationMixin<Nodes>;
}
