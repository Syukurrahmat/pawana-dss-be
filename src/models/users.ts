import { InferAttributes, InferCreationAttributes, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin} from 'sequelize'; //prettier-ignore
import {} from 'sequelize';
import { Model, Table, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import Activities from './activities.js';
import GroupPermissions from './grouppermissions.js';
import Groups from './groups.js';

@Table({ tableName: 'users' })
export default class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    userId?: number;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        validate: { notEmpty: true },
    })
    name!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(15),
        validate: { isNumeric: true, notEmpty: true },
    })
    phone!: string;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        validate: { notEmpty: true },
    })
    address?: string;

    @Column({
        allowNull: true,
        type: DataType.STRING(30),
    })
    description?: string;

    @Column({
        allowNull: false,
        type: DataType.ENUM('admin', 'user'),
        defaultValue: 'user',
    })
    role!: string;

    @Column({
        allowNull: true,
        type: DataType.BLOB,
    })
    profilePicture?: Uint8Array;

    @Column({
        type: DataType.STRING(35),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, isEmail: true },
    })
    email!: string;

    @Column({
        type: DataType.STRING(60),
        allowNull: true,
    })
    password!: string;

    @Column({
        type: DataType.BOOLEAN(),
        allowNull: false,
        validate: { notEmpty: true },
        defaultValue: false,
    })
    isVerified!: boolean;

    @HasMany(() => Activities, 'userId')
    activities?: Activities[];

    @BelongsToMany(() => Groups, () => GroupPermissions)
    groups?: Array<Groups & { GroupPermissions: GroupPermissions }>;

    @HasMany(() => GroupPermissions, 'userId')
    groupPermissions?: GroupPermissions;

    declare getGroups: BelongsToManyGetAssociationsMixin<Groups>;
    declare addGroup: BelongsToManyAddAssociationMixin<Groups, number>;
    declare addGroups: BelongsToManyAddAssociationsMixin<Groups, number>;
    declare setGroups: BelongsToManySetAssociationsMixin<Groups, number>;
    declare removeGroup: BelongsToManyRemoveAssociationMixin<Groups, number>;
    declare removeGroups: BelongsToManyRemoveAssociationsMixin<Groups, number>;
    declare hasGroup: BelongsToManyHasAssociationMixin<Groups, number>;
    declare hasGroups: BelongsToManyHasAssociationsMixin<Groups, number>;
    declare countGroups: BelongsToManyCountAssociationsMixin;
    declare createGroup: BelongsToManyCreateAssociationMixin<Groups>;
}
