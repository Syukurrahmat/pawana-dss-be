import { BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes } from 'sequelize'; //prettier-ignore
import { Model, Table, Column, DataType, HasMany, BelongsToMany, AutoIncrement, PrimaryKey, NotEmpty, AllowNull, Default, ForeignKey, BelongsTo } from 'sequelize-typescript'; //prettier-ignore
import DataLogs from './datalogs.js';
import Users from './users.js';
import UsersSubscription from './usersSubscriptions.js';
import Companies from './companies.js';
import CompanySubscriptions from './companySubscriptions.js';
import { coordinateGetterSetter } from '../lib/common.utils.js';
import moment from 'moment';

@Table({ tableName: 'nodes' })

export default class Nodes extends Model<InferAttributes<Nodes>, InferCreationAttributes<Nodes>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    nodeId?: number;


    @ForeignKey(() => Companies)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    companyId?: number | null;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(30))
    name!: string;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(255))
    description!: string;

    @Column(DataType.STRING(255))
    address?: string;

    @Column({
        type: DataType.GEOGRAPHY('POINT'),
        ...coordinateGetterSetter
    })
    coordinate?: number[]


    @AllowNull(false)
    @Default('neversentdata')
    @NotEmpty
    @Column(DataType.ENUM('active', 'nonactive', 'idle', 'neversentdata'))
    status?: string;


    @Column(DataType.DATEONLY)
    instalationDate?: Date;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(36))
    apiKey!: string;

    @Column(DataType.DATE)
    lastDataSent?: Date;
 

    @Column({
        type: DataType.VIRTUAL,
        get(this: Nodes) {
            if (!this.lastDataSent) return false
            return moment().diff(moment(this.lastDataSent), 'hour') <= 6
        },
        set() { },
    })
    isUptodate?: boolean

    // RELATIONSHIP WITH OTHER TABLES

    @BelongsTo(() => Companies)
    owner?: Companies;

    @BelongsToMany(() => Users, () => UsersSubscription)
    userSubscriptions?: Array<Users & { UsersSubscription: UsersSubscription }>;

    // ------

    @HasMany(() => DataLogs, 'nodeId')
    dataLogs?: DataLogs[]

    @BelongsToMany(() => Companies, () => CompanySubscriptions)
    companySubscriptions?: Array<Companies & { CompanySubscriptions: CompanySubscriptions }>;

    // RELATIONSHIP INTERFACE

    declare getUserSubscriptions: BelongsToManyGetAssociationsMixin<Users>;
    declare addUserSubscription: BelongsToManyAddAssociationMixin<Users, number>;
    declare addUserSubscriptions: BelongsToManyAddAssociationsMixin<Users, number>;
    declare setUserSubscriptions: BelongsToManySetAssociationsMixin<Users, number>;
    declare removeUserSubscription: BelongsToManyRemoveAssociationMixin<Users, number>;
    declare removeUserSubscriptions: BelongsToManyRemoveAssociationsMixin<Users, number>;
    declare hasUserSubscription: BelongsToManyHasAssociationMixin<Users, number>;
    declare hasUserSubscriptions: BelongsToManyHasAssociationsMixin<Users, number>;
    declare countUserSubscriptions: BelongsToManyCountAssociationsMixin;
    declare createUserSubscription: BelongsToManyCreateAssociationMixin<Users>;

    declare getCompanySubscriptions: BelongsToManyGetAssociationsMixin<Companies>;
    declare addCompanySubscription: BelongsToManyAddAssociationMixin<Companies, number>;
    declare addCompanySubscriptions: BelongsToManyAddAssociationsMixin<Companies, number>;
    declare setCompanySubscriptions: BelongsToManySetAssociationsMixin<Companies, number>;
    declare removeCompanySubscription: BelongsToManyRemoveAssociationMixin<Companies, number>;
    declare removeCompanySubscriptions: BelongsToManyRemoveAssociationsMixin<Companies, number>;
    declare hasCompanySubscription: BelongsToManyHasAssociationMixin<Companies, number>;
    declare hasCompanySubscriptions: BelongsToManyHasAssociationsMixin<Companies, number>;
    declare countCompanySubscriptions: BelongsToManyCountAssociationsMixin;
    declare createCompanySubscription: BelongsToManyCreateAssociationMixin<Companies>;

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
