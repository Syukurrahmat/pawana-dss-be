import { Model, Table, Column, DataType, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import ActivityNodesJuncs from "./activitynodesjuncs.js";
import Users from "./users.js";
import Groups from "./groups.js";
import Nodes from "./nodes.js";

@Table({ tableName: "activities" })

export default class Activities extends Model<InferAttributes<Activities>, InferCreationAttributes<Activities>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER
    })
    activityId?: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId!: number;

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
        type: DataType.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
    })
    description!: string;

    @Column({
        type: DataType.ENUM('production', 'maintenance', 'note', 'other'),
        allowNull: false,
        validate: { notEmpty: true },
    })
    type!: string;

    @Column({
        type: DataType.ENUM('pending', 'active', 'completed', 'cancelled'),
        allowNull: false,
        validate: { notEmpty: true },
        defaultValue: 'active'
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        validate: { notEmpty: true },
    })
    startAt!: Date;

    @Column({
        allowNull: true,
        type: DataType.DATE,
    })
    finishAt?: Date;

    @BelongsTo(() => Groups, 'groupId')
    groupTarget: Groups

    @BelongsToMany(() => Nodes, () => ActivityNodesJuncs)
    nodesTarget: Array<Nodes & { ActivityNodesJuncs: ActivityNodesJuncs }>;


}