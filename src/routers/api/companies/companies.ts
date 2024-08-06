import { createNewCompany, editCompanyProfile, getAllCompanies, getCompanyById, getAllSubscribedNode, getCompaniesSummary, deleteNodeSubscription, addNodeSubscription, getAllPrivateNode, getRemainingSubsLimit } from '../../../controller/companies.controler.js';
import { Router } from 'express';
import db from '../../../models/index.js';
import eventLogsRouter from './eventLogs.js';
import { dashboardDataForCompany } from '../../../controller/dashboard.controller.js';
import summaryRouter from './summary.js';

const companiesRouter = Router();

companiesRouter.route('')
    .get(getAllCompanies)
    .post(createNewCompany)

companiesRouter.get('/summary', getCompaniesSummary);


const companyByIdRouter = Router({ mergeParams: true })
companiesRouter.use('/:id', companyByIdRouter)

companyByIdRouter.use(async (req, res, next) => {
    const companies = await db.Companies.findByPk(req.params.id)

    if (!companies) return res.status(404)
    req.company = companies
    next()
})

companyByIdRouter.route('')
    .get(getCompanyById)
    .put(editCompanyProfile)


companyByIdRouter.route('/nodes')
    .get(getAllSubscribedNode)
    .post(addNodeSubscription)
    .delete(deleteNodeSubscription)

companyByIdRouter.get('/private-nodes', getAllPrivateNode)

companyByIdRouter.get('/remaining-subs-limit', getRemainingSubsLimit)

companyByIdRouter.use('/events', eventLogsRouter)
companyByIdRouter.use('/summary', summaryRouter)
companyByIdRouter.get('/dashboard', dashboardDataForCompany)


export default companiesRouter;
