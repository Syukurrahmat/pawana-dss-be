import { Model, Table, Column, DataType, ForeignKey, AllowNull, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import Companies from './companies.js';
import Nodes from './nodes.js';
import Users from './users.js';

@Table({ tableName: 'userssubscriptions' })

export default class UsersSubscriptions extends Model<InferAttributes<UsersSubscriptions>, InferCreationAttributes<UsersSubscriptions>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    usersSubscriptionId?: number;

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId!: number;

    @ForeignKey(() => Nodes)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    nodeId!: number;
}
