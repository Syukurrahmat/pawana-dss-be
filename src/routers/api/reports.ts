import { Router } from 'express';
import { getCurrentReport , createReport} from '../../controller/report.controller.js';

// ================== /api/reports/* ==================

const reportRouter = Router();


reportRouter.route('')                   //  /api/reports
    .get(getCurrentReport)
    .post(createReport)

export default reportRouter;
