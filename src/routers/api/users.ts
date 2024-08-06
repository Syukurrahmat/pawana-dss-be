import { Router } from 'express';
import { addNodeSubscription, createNewUser, deleteNodeSubscription, editUserProfile, getManagedCompanies, getSubscribedNodes, getAllUsers, getUser, getUsersSummary, editUserPassword, getRemainingSubsLimit, getOwnNodes, getOwnNodesSummary } from '../../controller/users.controler.js';
import { dashboardDataForRegularUser } from '../../controller/dashboard.controller.js';

const usersRouter = Router();


usersRouter.route('/')
    .get(getAllUsers)
    .post(createNewUser)

usersRouter.get('/summary', getUsersSummary);

// usersRouter.route('/').

usersRouter.route('/:id')
    .get(getUser)
    .put(editUserProfile);

usersRouter.get('/:id/dashboard', dashboardDataForRegularUser)
usersRouter.get('/:id/remaining-subs-limit', getRemainingSubsLimit)

usersRouter.put('/:id/password', editUserPassword)

usersRouter.route('/:id/nodes')
    .get(getSubscribedNodes)
    .post(addNodeSubscription)
    .delete(deleteNodeSubscription)

usersRouter.get('/:id/own-nodes/summary', getOwnNodesSummary)

usersRouter.route('/:id/own-nodes')
    .get(getOwnNodes)



usersRouter.route('/:id/companies')
    .get(getManagedCompanies)

export default usersRouter;
