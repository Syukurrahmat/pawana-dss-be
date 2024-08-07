import { Model, Table, Column, DataType, ForeignKey, PrimaryKey, AutoIncrement, AllowNull, NotEmpty, BelongsTo } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import Users from "./users.js";
import { coordinateGetterSetter } from '../../lib/common.utils.js';

@Table({ tableName: "reports" })

export default class Reports extends Model<InferAttributes<Reports>, InferCreationAttributes<Reports>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    reportId!: number;

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.TINYINT({ unsigned: true }))
    rating!: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(255))
    message!: string;

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.GEOGRAPHY('POINT'),
        ...coordinateGetterSetter
    })
    coordinate!: number[]


    @Column({
        type: DataType.STRING(255),
        set(value) {
            if (value && Array.isArray(value)) return this.setDataValue('images', value.join('\n'));
            return this.setDataValue('images', value);
        },
        get() {
            const value = this.getDataValue('images')
            return value ? value.split('\n') : []
        }
    })
    images?: string[];


    @BelongsTo(() => Users)
    creator?: Users;

    declare date: string;
}