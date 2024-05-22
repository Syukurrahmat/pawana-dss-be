import { searchCompanies, searchNodes, searchUsers} from '../../controller/search.controller.js';
import { Router } from 'express';

// ================== /api/search/* ==================

const searchRouter = Router();

searchRouter.get('/users', searchUsers);
searchRouter.get('/nodes', searchNodes);
searchRouter.get('/companies', searchCompanies);


export default searchRouter;
