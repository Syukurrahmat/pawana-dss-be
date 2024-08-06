import { Sequelize } from 'sequelize-typescript';
import EventLogs from './eventLogs.js';
import DataLogs from './datalogs.js';
import UsersSubscription from './usersSubscriptions.js';
import Companies from './companies.js';
import CompanySubscription from './companySubscriptions.js';
import Nodes from './nodes.js';
import Users from './users.js';
import Reports from './reports.js';

const sequelize = new Sequelize({
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    logging: false,
});

sequelize.addModels([
    EventLogs,
    CompanySubscription,
    DataLogs,
    UsersSubscription,
    Companies,
    Users,
    Nodes,
    Reports,
]);

const db = {
    sequelize,
    Companies,
    CompanySubscription,
    DataLogs,
    UsersSubscription,
    Nodes,
    Users,
    Reports,
    EventLogs
};

export default db;
