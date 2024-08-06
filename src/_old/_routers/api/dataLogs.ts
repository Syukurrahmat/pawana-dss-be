import { Router } from 'express';
import { getDownloadableNode } from '../../_controller/datalogs.controler.js';
import { getDatalogs } from '../../_controller/nodes.controler.js';
import { postDatafromSensor } from '../../_controller/datalogs.controler.js';

export const dataLogsRouter = Router();

dataLogsRouter.route('/')
    .get(getDatalogs)
    .post(postDatafromSensor)

dataLogsRouter.get('/downloadable-node', getDownloadableNode)
dataLogsRouter.post('/',)

export default dataLogsRouter;



