import { createNewCompany, editCompanyProfile, getAllCompanies, getCompanyById, getAllGroupNodes, changeMemberStatus, getCompaniesSummary } from '../../controller/companies.controler.js'; //prettier-ignore
import { Router } from 'express';

const companiesRouter = Router();

companiesRouter.route('')       //  /api/companies
    .get(getAllCompanies)
    .post(createNewCompany)

companiesRouter.get('/summary', getCompaniesSummary);   //  /api/companies/:id

companiesRouter.route('/:id')   //  /api/companies/:id
    .get(getCompanyById)
    .put(editCompanyProfile)

companiesRouter.route('/:id/nodes') //  /api/companies/:id/nodes
    .get(getAllGroupNodes);
    


    
export default companiesRouter;
