import { Router } from 'express';
import {
    createNewNode,
    deleteCompanySubscription,
    deleteUsersSubscription,
    downloadableNode,
    editNode,
    getAllNodes,
    getAvailableNode,
    getCompaniesHaveSubscribed,
    getDatalogs,
    getNodeById,
    getNodesSummary,
    getUsersHaveSubscribed
} from '../../_controller/nodes.controler.js';


const nodesRouter = Router();

nodesRouter.route('')
    .get(getAllNodes)
    .post(createNewNode);


nodesRouter.get('/summary', getNodesSummary)

nodesRouter.get('/available', getAvailableNode)
nodesRouter.get('/downloadable', downloadableNode)


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
