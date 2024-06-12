import { createNewCompany, editCompanyProfile, getAllCompanies, getCompanyById, getAllSubscribedNode, getCompaniesSummary, deleteNodeSubscription, addNodeSubscription, getCalenderEventLogs, createNewEvent, getEventLogsById, getCurrentEventLogs, getAllPrivateNode, setEventIsCompleted, editEvent, deleteEvent, setEventIsStartNow } from '../../controller/companies.controler.js';
import { Router } from 'express';

const companiesRouter = Router();

companiesRouter.route('')
    .get(getAllCompanies)
    .post(createNewCompany)

companiesRouter.get('/summary', getCompaniesSummary);

companiesRouter.route('/:id')
    .get(getCompanyById)
    .put(editCompanyProfile)

companiesRouter.route('/:id/nodes')
    .get(getAllSubscribedNode)
    .post(addNodeSubscription)
    .delete(deleteNodeSubscription)

companiesRouter.route('/:id/private-nodes')
    .get(getAllPrivateNode)



companiesRouter.route('/:id/events')
    .get(getCalenderEventLogs)
    .post(createNewEvent)

companiesRouter.get('/:id/events/current', getCurrentEventLogs)
companiesRouter.put('/:id/events/:eventId/completed', setEventIsCompleted)
companiesRouter.put('/:id/events/:eventId/startnow', setEventIsStartNow)

companiesRouter.route('/:id/events/:eventId')
    .get(getEventLogsById)
    .put(editEvent)
    .delete(deleteEvent)




export default companiesRouter;
