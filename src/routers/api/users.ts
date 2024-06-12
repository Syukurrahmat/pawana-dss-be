import { Router } from 'express';
import { addNodeSubscription, createNewUser, deleteNodeSubscription, editUserProfile, getManagedCompanies, getSubscribedNodes, getAllUsers, getUser, getUsersSummary, editUserPassword } from '../../controller/users.controler.js';
import { accessControl as ac, accessControlSetResource } from '../../auth/accesssControl.js';

const usersRouter = Router();

usersRouter.use(accessControlSetResource('Users'))

usersRouter.route('/')
    .get(ac, getAllUsers)
    .post(ac, createNewUser)

usersRouter.get('/summary', ac, getUsersSummary);

// usersRouter.route('/').

usersRouter.route('/:id')
    .get(ac, getUser)
    .put(ac, editUserProfile);

usersRouter.put('/:id/password', ac, editUserPassword)

usersRouter.route('/:id/nodes')
    .get(ac, getSubscribedNodes)
    .post(ac, addNodeSubscription)
    .delete(ac, deleteNodeSubscription)

usersRouter.route('/:id/companies')
    .get(ac, getManagedCompanies)

export default usersRouter;
