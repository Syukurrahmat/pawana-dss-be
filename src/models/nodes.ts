import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    BelongsToMany,
    HasMany,
} from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import Groups from './groups.js';
import ActivityNodesJuncs from './activitynodesjuncs.js';
import Activities from './activities.js';
import DataLogs from './datalogs.js';

@Table({ tableName: 'nodes' })
export default class Nodes extends Model<InferAttributes<Nodes>, InferCreationAttributes<Nodes>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    nodeId?: number;

    @ForeignKey(() => Groups)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    groupId!: number;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        validate: { notEmpty: true },
    })
    name!: string;

    @Column({
        allowNull: true,
        type: DataType.STRING(64),
    })
    description?: string;

    @Column({
        type: DataType.DECIMAL(11, 8),
        allowNull: false,
        validate: { notEmpty: true },
    })
    longitude!: number;

    @Column({
        type: DataType.DECIMAL(10, 8),
        allowNull: false,
        validate: { notEmpty: true },
    })
    latitude!: number;

    @Column({
        allowNull: false,
        type: DataType.ENUM('normal', 'maintenance'),
        defaultValue: 'normal',
    })
    status!: string;

    @Column({
        type: DataType.ENUM('indoor', 'outdoor'),
        allowNull: false,
        validate: { notEmpty: true },
    })
    environment!: string;

    @Column({
        type: DataType.STRING(36),
        allowNull: false,
        validate: { notEmpty: true },
    })
    apiKey!: string;

    @BelongsToMany(() => Activities, () => ActivityNodesJuncs)
    activities: Array<Activities & { ActivityNodesJuncs: ActivityNodesJuncs }>;

    @HasMany(() => DataLogs)
    data: DataLogs[];
}
