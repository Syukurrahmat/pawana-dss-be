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
    @Column(DataType.ENUM('production', 'maintenance', 'note', 'other'))
    type!: string;

    @AllowNull(false)
    @NotEmpty
    @Default('inprogress')
    @Column(DataType.ENUM('inprogress', 'completed', 'cancelled'))
    status!: string;

    @Column(DataType.STRING(255))
    location?: string;
    
    @AllowNull(false)
    @NotEmpty
    @Column(DataType.DATEONLY)
    date!: Date;
    
    @AllowNull(false)
    @NotEmpty
    @Column(DataType.DATEONLY)
    finishDate?: Date;
}