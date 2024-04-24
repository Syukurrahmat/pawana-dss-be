import { Sequelize } from 'sequelize-typescript';
import Activities from './activities.js';
import DataLogs from './datalogs.js';
import GroupPermissions from './grouppermissions.js';
import Groups from './groups.js';
import ActivityNodesJuncs from './activitynodesjuncs.js';
import Nodes from './nodes.js';
import Users from './users.js';

const sequelize = new Sequelize({
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    logging: false,
});

sequelize.addModels([
    Activities,
    ActivityNodesJuncs,
    DataLogs,
    GroupPermissions,
    Groups,
    Nodes,
    Users,
]);

const db = {
    sequelize,
    Activities,
    ActivityNodesJuncs,
    DataLogs,
    GroupPermissions,
    Groups,
    Nodes,
    Users,
};

export default db;
