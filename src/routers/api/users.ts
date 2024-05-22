import { Router } from 'express';
import { addNodeSubscription, createNewUser, deleteNodeSubscription, editUserProfile, getManagedCompanies, getSubscribedNodes, getAllUsers, getUser, getUsersSummary } from '../../controller/users.controler.js'; //prettier-ignore

const usersRouter = Router();

usersRouter.route('')                           //  /api/users
    .get(getAllUsers)
    .post(createNewUser)

usersRouter.get('/summary', getUsersSummary);   //  /api/summary

usersRouter.route('/:id')                       //  /api/users/id
    .get(getUser)
    .put(editUserProfile);


usersRouter.route('/:id/nodes')                 //  /api/users/id/nodes
    .get(getSubscribedNodes)
    .post(addNodeSubscription)
    .delete(deleteNodeSubscription)      

usersRouter.route('/:id/companies')             // api/companies/:id
    .get(getManagedCompanies)

export default usersRouter;
