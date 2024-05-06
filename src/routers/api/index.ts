import { Router } from 'express';
import dashboardData from '../dashboardData.js';
import usersRouter from './users.js';
import groupsRouter from './groups.js';
import nodesRouter from './nodes.js';
import searchRouter from './search.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/nodes', nodesRouter);
router.use('/search', searchRouter);

router.get('/dashboard/data', async (req, res) => {
    res.json(await dashboardData());
});

export default router;
