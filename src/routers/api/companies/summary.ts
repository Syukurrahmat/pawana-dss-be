import { Router } from 'express';
import { getSummary } from '../../../controller/summary.controller.js';

const summaryRouter = Router({mergeParams : true});

summaryRouter.get('/monthly', getSummary('month'))
summaryRouter.get('/weekly', getSummary('week'))

export default summaryRouter;
