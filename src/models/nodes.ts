import { HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes } from 'sequelize'; //prettier-ignore
import { Model, Table, Column, DataType, ForeignKey, BelongsToMany, HasMany, BelongsTo} from 'sequelize-typescript'; //prettier-ignore
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
    })
    apiKey!: string;

    @Column({
        type: DataType.DATE,
    })
    lastDataSent!: string;

    @BelongsToMany(() => Activities, () => ActivityNodesJuncs)
    activities: Array<Activities & { ActivityNodesJuncs: ActivityNodesJuncs }>;

    @HasMany(() => DataLogs)
    data: DataLogs[];

    @BelongsTo(() => Groups)
    group?: Groups;

    declare getDataLogs: HasManyGetAssociationsMixin<DataLogs>;
    declare addDataLog: HasManyAddAssociationMixin<DataLogs, number>;
    declare addDataLogs: HasManyAddAssociationsMixin<DataLogs, number>;
    declare setDataLogs: HasManySetAssociationsMixin<DataLogs, number>;
    declare removeDataLog: HasManyRemoveAssociationMixin<DataLogs, number>;
    declare removeDataLogs: HasManyRemoveAssociationsMixin<DataLogs, number>;
    declare hasDataLog: HasManyHasAssociationMixin<DataLogs, number>;
    declare hasDataLogs: HasManyHasAssociationsMixin<DataLogs, number>;
    declare countDataLogs: HasManyCountAssociationsMixin;
    declare createDataLog: HasManyCreateAssociationMixin<DataLogs>;
}
