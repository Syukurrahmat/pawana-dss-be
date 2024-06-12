import { Router } from 'express';
import { getDownloadableNode } from '../../controller/datalogs.controler.js';
import { getDatalogs } from '../../controller/nodes.controler.js';
import { postDatafromSensor } from '../../controller/datalogs.controler.js';

export const dataLogsRouter = Router();

dataLogsRouter.route('/')
    .get(getDatalogs)
    .post(postDatafromSensor)

dataLogsRouter.get('/downloadable-node', getDownloadableNode)
dataLogsRouter.post('/',)

export default dataLogsRouter;



