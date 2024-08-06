import Companies from './companies.js';
import CompanySubscription from './companySubscriptions.js';
import DataLogs from './datalogs.js';
import EventLogs from './eventLogs.js';
import Nodes from './nodes.js';
import Reports from './reports.js';
import Users from './users.js';
import UsersSubscription from './usersSubscriptions.js';

 
const allDBModels = [
    Companies,
    CompanySubscription,
    DataLogs,
    UsersSubscription,
    Nodes,
    Users,
    Reports,
    EventLogs
]

export default allDBModels;
