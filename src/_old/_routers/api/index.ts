import { Router } from 'express';
import usersRouter from './users.js';
import companiesRouter from './companies/companies.js';
import nodesRouter from './nodes.js';
import searchRouter from './search.js';
import dataLogsRouter from './dataLogs.js';
import reportRouter from './reports.js';
import meRouter from './me.js';
import summaryRouter from './companies/summary.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/companies', companiesRouter);
router.use('/nodes', nodesRouter);
router.use('/datalogs', dataLogsRouter);
router.use('/reports', reportRouter);
router.use('/search', searchRouter);

router.use('/summary', summaryRouter);
router.use('/me', meRouter);


export default router;
