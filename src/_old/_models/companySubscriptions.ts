import { Model, Column, DataType, ForeignKey, Table, PrimaryKey, AutoIncrement, AllowNull } from "sequelize-typescript";
import Nodes from "./nodes.js";
import Companies from "./companies.js";
import { InferAttributes, InferCreationAttributes } from "sequelize";

@Table({ tableName: "companysubscriptions" })

export default class CompanySubscriptions extends Model<InferAttributes<CompanySubscriptions>, InferCreationAttributes<CompanySubscriptions>> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	companySubscriptionId?: number;

	@ForeignKey(() => Companies)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	companyId!: number;

	@ForeignKey(() => Nodes)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	nodeId!: number;
}