import { Model, Table, Column, DataType, ForeignKey, PrimaryKey, AutoIncrement, AllowNull, NotEmpty, Default } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import Companies from "./companies.js";

@Table({ tableName: "eventlogs" })


export default class EventLogs extends Model<InferAttributes<EventLogs>, InferCreationAttributes<EventLogs>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    eventLogId!: number;

    @ForeignKey(() => Companies)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    companyId!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(30))
    name!: string;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(255))
    description!: string;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.ENUM('production', 'maintenance', 'training', 'administrative', 'repair', 'other'))
    type!: string;

    @AllowNull(false)
    @Default('in progress')
    @Column(DataType.ENUM('in progress', 'completed', 'not started yet'))
    status!: string;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isCompleted!: boolean;

    @Column(DataType.STRING(255))
    location?: string;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.DATEONLY)
    startDate!: Date;

    @NotEmpty
    @Column(DataType.DATEONLY)
    endDate?: Date;
}


 
