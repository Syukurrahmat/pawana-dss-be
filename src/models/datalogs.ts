import {Model, Table, Column, DataType, ForeignKey} from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import Nodes from "./nodes.js";

@Table({ tableName: "datalogs" , timestamps : false})

export default class DataLogs extends Model<InferAttributes<DataLogs>, InferCreationAttributes<DataLogs>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.BIGINT
    })
    dataLogId?: number;

    @ForeignKey(() => Nodes)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    nodeId!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        validate: { notEmpty: true },
    })
    datetime!: Date;

    @Column({
        type: DataType.FLOAT(12),
        allowNull: false,
        validate: { notEmpty: true },
    })
    pm25!: number;

    @Column({
        type: DataType.FLOAT(12),
        allowNull: false,
        validate: { notEmpty: true },
    })
    pm100!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: { notEmpty: true },
    })
    ch4!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: { notEmpty: true },
    })
    co2!: number;

    @Column({
        type: DataType.FLOAT(12),
        allowNull: false,
        validate: { notEmpty: true },
    })
    temperature!: number;

    @Column({
        type: DataType.FLOAT(12),
        allowNull: false,
        validate: { notEmpty: true },
    })
    humidity!: number;
}