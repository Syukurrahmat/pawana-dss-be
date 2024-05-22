import { InferAttributes, InferCreationAttributes, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize'; //prettier-ignore
import { Model, Table, Column, DataType, HasMany, BelongsToMany, PrimaryKey, AutoIncrement, AllowNull, NotEmpty, IsNumeric, Default, Unique, IsEmail } from 'sequelize-typescript';
import UsersSubscription from './usersSubscriptions.js';
import Companies from './companies.js';
import Reports from './reports.js';
import Nodes from './nodes.js';
import bcrypt from 'bcryptjs';
import { myBcriptSalt } from '../utils/utils.js';

@Table({ tableName: 'users' })

export default class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    userId?: number;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(30))
    name!: string;

    @AllowNull(false)
    @NotEmpty
    @IsNumeric
    @Column(DataType.STRING(16))
    phone!: string;

    @AllowNull(false)
    @NotEmpty
    @Column(DataType.STRING(255))
    address!: string;

    @Column(DataType.STRING(255))
    description?: string;

    @AllowNull(false)
    @Default('regular')
    @NotEmpty
    @Column(DataType.ENUM('admin', 'gov', 'manager', 'regular'))
    role!: string;

    @Column(DataType.BLOB)
    profilePicture?: Uint8Array;

    @Unique
    @AllowNull(false)
    @IsEmail
    @NotEmpty
    @Column(DataType.STRING(255))
    email!: string;

    @AllowNull(false)
    @NotEmpty
    @Column({
        type: DataType.STRING(60),
        set(value: string) {
            this.setDataValue('password', bcrypt.hashSync(value, myBcriptSalt));
        }
    })
    password!: string;

    @Default(false)
    @AllowNull(false)
    @NotEmpty
    @Column(DataType.BOOLEAN)
    isVerified!: boolean;


    @HasMany(() => Reports, 'userId')
    reports?: Reports[]

    @BelongsToMany(() => Nodes, () => UsersSubscription)
    subscribedNodes?: Array<Nodes & { UsersSubscription: UsersSubscription }>;

    @HasMany(() => Companies, 'managedBy')
    companies?: Companies[]

    @HasMany(() => Nodes, 'ownerId')
    nodes?: Users[]

    declare getCompanies: HasManyGetAssociationsMixin<Companies>;
    declare addCompany: HasManyAddAssociationMixin<Companies, number>;
    declare addCompanies: HasManyAddAssociationsMixin<Companies, number>;
    declare setCompanies: HasManySetAssociationsMixin<Companies, number>;
    declare removeCompany: HasManyRemoveAssociationMixin<Companies, number>;
    declare removeCompanies: HasManyRemoveAssociationsMixin<Companies, number>;
    declare hasCompany: HasManyHasAssociationMixin<Companies, number>;
    declare hasCompanies: HasManyHasAssociationsMixin<Companies, number>;
    declare countCompanies: HasManyCountAssociationsMixin;
    declare createCompany: HasManyCreateAssociationMixin<Companies>;

    declare getReports: HasManyGetAssociationsMixin<Reports>;
    declare addReport: HasManyAddAssociationMixin<Reports, number>;
    declare addReports: HasManyAddAssociationsMixin<Reports, number>;
    declare setReports: HasManySetAssociationsMixin<Reports, number>;
    declare removeReport: HasManyRemoveAssociationMixin<Reports, number>;
    declare removeReports: HasManyRemoveAssociationsMixin<Reports, number>;
    declare hasReport: HasManyHasAssociationMixin<Reports, number>;
    declare hasReports: HasManyHasAssociationsMixin<Reports, number>;
    declare countReports: HasManyCountAssociationsMixin;
    declare createReport: HasManyCreateAssociationMixin<Reports>;

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


    count : number
}
