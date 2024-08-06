import { searchCompanies, searchNodes, searchUsers} from '../../_controller/search.controller.js';
import { Router } from 'express';

// ================== /api/search/* ==================

const searchRouter = Router();

searchRouter.get('/users', searchUsers);
searchRouter.get('/nodes', searchNodes);
searchRouter.get('/companies', searchCompanies);

searchRouter.get('/avaiable-nodes', searchNodes);

export default searchRouter;