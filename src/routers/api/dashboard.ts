import { Router } from 'express';
import { dashboardData } from '../../controller/dashboard.controller.js';
 

const dashboardRouter = Router();
dashboardRouter.get('/', dashboardData)

export default dashboardRouter;
