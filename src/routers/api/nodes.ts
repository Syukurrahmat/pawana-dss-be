import { Router } from 'express';
import {
    editNode,
    getAllNodes,
    getNodeById, getUsersHaveSubscribed,
    createNewNode,
    deleteUsersSubscription,
    deleteCompanySubscription,
    getNodesSummary,
    getCompaniesHaveSubscribed,
    toggleNodeStatus,
    getDatalogs,
    getAvailableNode,
    downloadableNode
} from '../../controller/nodes.controler.js';


const nodesRouter = Router();



nodesRouter.route('')
    .get(getAllNodes)
    .post(createNewNode);


nodesRouter.get('/summary', getNodesSummary)
nodesRouter.get('/available', getAvailableNode)
nodesRouter.get('/downloadable', downloadableNode)

nodesRouter.put('/:id/toggle-status', toggleNodeStatus)

nodesRouter.route('/:id')
    .get(getNodeById)
    .put(editNode)


nodesRouter.route('/:id/users')
    .get(getUsersHaveSubscribed)
    .delete(deleteUsersSubscription)

nodesRouter.route('/:id/companies')
    .get(getCompaniesHaveSubscribed)
    .delete(deleteCompanySubscription)

nodesRouter.get('/:id/datalogs', getDatalogs)


export default nodesRouter;
