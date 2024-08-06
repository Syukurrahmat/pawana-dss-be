import { Router } from 'express';
import { getReport , createReport} from '../../_controller/report.controller.js';

// ================== /api/reports/* ==================

const reportRouter = Router();


reportRouter.route('')                   //  /api/reports
    .get(getReport)
    .post(createReport)

export default reportRouter;
