import { Router } from 'express';
import {
    addGroupSubscription,
    editUserProfile,
    getAllMemberSubscription,
    getAllUsers,
    getUserProfileById,
} from '../../controller/users.controler.js';

// ================== /api/users/* ==================

const usersRouter = Router();

// prettier-ignore
usersRouter.route('')
    .get(getAllUsers)

// prettier-ignore
usersRouter.route('/:id')
    .get(getUserProfileById)
    .put(editUserProfile);

// prettier-ignore
usersRouter.route('/:id/groups')
    .get(getAllMemberSubscription)
    .post(addGroupSubscription);

export default usersRouter;
