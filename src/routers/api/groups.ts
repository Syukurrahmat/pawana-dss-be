import { Router } from 'express';
import db from '../../models/index.js';
import { Op } from 'sequelize';
import { createNewGroup, editGroupProfile, getAllGroups, getGroupProfileById, getAllGroupMembers, getAllGroupNodes, changeMemberStatus, addGroupMembers } from '../../controller/groups.controler.js'; //prettier-ignore

const groupsRouter = Router();

//prettier-ignore
groupsRouter.route('')
    .get(getAllGroups)
    .post(createNewGroup)
    .put(editGroupProfile);

groupsRouter.get('/:id', getGroupProfileById);

//prettier-ignore
groupsRouter.route('/:id/users')
    .get(getAllGroupMembers)
    .post(addGroupMembers);

groupsRouter.get('/:id/nodes', getAllGroupNodes);

groupsRouter.put('/:id/permission', changeMemberStatus);

export default groupsRouter;
