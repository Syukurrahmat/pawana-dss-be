import { Router } from 'express';
import dashboardData from '../dashboardData.js';
import usersRouter from './users.js';
import groupRouter from './group.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/groups', groupRouter);

router.get('/dashboard/data', async (req, res) => {
    res.json(await dashboardData());
});

export default router;
