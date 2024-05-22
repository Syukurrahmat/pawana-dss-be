import { Router } from 'express';
import usersRouter from './users.js';
import companiesRouter from './companies.js';
import nodesRouter from './nodes.js';
import searchRouter from './search.js';
import dataLosgRouter from './dataLogs.js';
import reportRouter from './reports.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/companies', companiesRouter);
router.use('/nodes', nodesRouter);
router.use('/datalogs', dataLosgRouter);
router.use('/reports', reportRouter);
router.use('/search', searchRouter);


export default router;
