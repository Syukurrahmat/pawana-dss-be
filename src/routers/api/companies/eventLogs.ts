import { getCalenderEventLogs, createNewEvent, getEventLogsById, getCurrentEventLogs, setEventIsCompleted, editEvent, deleteEvent, setEventIsStartNow } from '../../../controller/eventLogs.controller.js';
import { Router } from 'express';

const eventLogsRouter = Router({ mergeParams: true });

 
eventLogsRouter.route('')
    .get(getCalenderEventLogs)
    .post(createNewEvent);

eventLogsRouter.get('/current', getCurrentEventLogs);

eventLogsRouter.route('/:eventId')
    .get(getEventLogsById)
    .put(editEvent)
    .delete(deleteEvent);

eventLogsRouter.put('/:eventId/completed', setEventIsCompleted);
eventLogsRouter.put('/:eventId/startnow', setEventIsStartNow);

export default eventLogsRouter