import { Router } from 'express';
import {
    searchGoupWithSubsStatus,
    searchUsersWithSubsStatus,
} from '../../controller/search.controller.js';

// ================== /api/search/* ==================

const searchRouter = Router();

searchRouter.get('/users', searchUsersWithSubsStatus);
searchRouter.get('/groups', searchGoupWithSubsStatus);

export default searchRouter;
