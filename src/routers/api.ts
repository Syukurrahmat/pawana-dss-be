import { Router } from 'express';
import passport from 'passport';
import dashboardData from './dashboardData.js';
import { isAuthenticated } from '../middleware/userAccess.js';

const router = Router();

router.get('/dashboard-data', async (req, res) => {
    res.json(await dashboardData());
});

export default router;
