import { Router } from 'express';
import {
    editNode,
    getAllNodes,
    getNodeById, getAllUsersSubscription,
    createNewNode,
    getNodesSummary,
} from '../../controller/nodes.controler.js';

const nodesRouter = Router();


nodesRouter.route('')           //  /api/nodes
    .get(getAllNodes)
    .post(createNewNode);

nodesRouter.route('/summary')   //  /api/nodes/summary
    .get(getNodesSummary)

nodesRouter.route('/:id')       //  /api/nodes/:id
    .get(getNodeById)
    .put(editNode)

nodesRouter.route('/usersubscriptions')       //  /api/nodes/:id/usersubscriptions
    .get(getAllUsersSubscription)


export default nodesRouter;
