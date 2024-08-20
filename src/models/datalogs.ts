import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    NotEmpty,
} from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import Nodes from './nodes.js';

@Table({ tableName: 'datalogs', timestamps: false })
export default class DataLogs extends Model<
    InferAttributes<DataLogs>,
    InferCreationAttributes<DataLogs>
> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    dataLogId?: number;

    @ForeignKey(() => Nodes)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    nodeId?: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.DATE)
    datetime!: Date;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.FLOAT)
    pm25!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.FLOAT)
    pm100!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.INTEGER)
    ch4!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.INTEGER)
    co2!: number;

    @NotEmpty
    @Column(DataType.FLOAT)
    temperature?: number;

    @NotEmpty
    @Column(DataType.FLOAT)
    humidity?: number;

    hour?: string;
}
