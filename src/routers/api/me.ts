import { Router } from 'express';
import { changeActiveDashboard, getRemainingSubsLimit, getProfileInformation, getMyCompaniesList } from '../../controller/me.controller.js';

const meRouter = Router();

meRouter.get('/', getProfileInformation);
meRouter.get('/companies', getMyCompaniesList);
meRouter.get('/remaining-subs-limit', getRemainingSubsLimit);
meRouter.put('/active-dashboard', changeActiveDashboard)

export default meRouter;
