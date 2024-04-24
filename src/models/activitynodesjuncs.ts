import { Model, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import Activities from "./activities.js";
import Nodes from "./nodes.js";

@Table({ tableName: "activitynodesjuncs", timestamps:false })

export default class ActivityNodesJuncs extends Model {
	@ForeignKey(() => Activities)
	@Column({ type: DataType.INTEGER })
	activityId!: number;

	@ForeignKey(() => Nodes)
	@Column({ type: DataType.INTEGER })
	nodeId!: number;
}