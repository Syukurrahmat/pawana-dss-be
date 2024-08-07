import { BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes } from 'sequelize'; //prettier-ignore
import { Model, Table, Column, DataType, HasMany, BelongsToMany, ForeignKey, PrimaryKey, AutoIncrement, AllowNull, NotEmpty, BelongsTo } from 'sequelize-typescript';
import Nodes from './nodes.js';
import Users from './users.js';
import EventLogs from './eventLogs.js';
import CompanySubscription from './companySubscriptions.js';
import { coordinateGetterSetter } from '../../lib/common.utils.js';

@Table({ tableName: 'companies' })

export default class Companies extends Model<InferAttributes<Companies>, InferCreationAttributes<Companies>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    companyId?: number;

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    managedBy!: number;


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
    @Column(DataType.STRING(255))
    address!: string;


    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.GEOGRAPHY('POINT'),
        ...coordinateGetterSetter
    })
    coordinate!: number[]

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.ENUM('tofufactory', 'service', 'agriculture', 'retailstore', 'restaurant ', 'other'))
    type!: string;


    @BelongsTo(() => Users)
    manager?: Users;




    @HasMany(() => Nodes, 'companyId')
    privateNodes?: Nodes[]

    @HasMany(() => EventLogs, 'companyId')
    eventLogs?: EventLogs[]

    @BelongsToMany(() => Nodes, () => CompanySubscription)
    subscribedNodes?: Array<Nodes & { CompanySubscription: CompanySubscription }>;


    declare getSubscribedNodes: BelongsToManyGetAssociationsMixin<Nodes>;
    declare addSubscribedNode: BelongsToManyAddAssociationMixin<Nodes, number>;
    declare addSubscribedNodes: BelongsToManyAddAssociationsMixin<Nodes, number>;
    declare setSubscribedNodes: BelongsToManySetAssociationsMixin<Nodes, number>;
    declare removeSubscribedNode: BelongsToManyRemoveAssociationMixin<Nodes, number>;
    declare removeSubscribedNodes: BelongsToManyRemoveAssociationsMixin<Nodes, number>;
    declare hasSubscribedNode: BelongsToManyHasAssociationMixin<Nodes, number>;
    declare hasSubscribedNodes: BelongsToManyHasAssociationsMixin<Nodes, number>;
    declare countSubscribedNodes: BelongsToManyCountAssociationsMixin;
    declare createSubscribedNode: BelongsToManyCreateAssociationMixin<Nodes>;

    declare getEventLogs: HasManyGetAssociationsMixin<EventLogs>;
    declare addEventLog: HasManyAddAssociationMixin<EventLogs, number>;
    declare addEventLogs: HasManyAddAssociationsMixin<EventLogs, number>;
    declare setEventLogs: HasManySetAssociationsMixin<EventLogs, number>;
    declare removeEventLog: HasManyRemoveAssociationMixin<EventLogs, number>;
    declare removeEventLogs: HasManyRemoveAssociationsMixin<EventLogs, number>;
    declare hasEventLog: HasManyHasAssociationMixin<EventLogs, number>;
    declare hasEventLogs: HasManyHasAssociationsMixin<EventLogs, number>;
    declare countEventLogs: HasManyCountAssociationsMixin;
    declare createEventLog: HasManyCreateAssociationMixin<EventLogs>;

    declare getPrivateNodes: HasManyGetAssociationsMixin<Nodes>;
    declare addPrivateNode: HasManyAddAssociationMixin<Nodes, number>;
    declare addPrivateNodes: HasManyAddAssociationsMixin<Nodes, number>;
    declare setPrivateNodes: HasManySetAssociationsMixin<Nodes, number>;
    declare removePrivateNode: HasManyRemoveAssociationMixin<Nodes, number>;
    declare removePrivateNodes: HasManyRemoveAssociationsMixin<Nodes, number>;
    declare hasPrivateNode: HasManyHasAssociationMixin<Nodes, number>;
    declare hasPrivateNodes: HasManyHasAssociationsMixin<Nodes, number>;
    declare countPrivateNodes: HasManyCountAssociationsMixin;
    declare createPrivateNode: HasManyCreateAssociationMixin<Nodes>;

    count?: number
}
