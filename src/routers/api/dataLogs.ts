import { Router } from 'express';
import {
    editNode,
    getAllNodes,
    getNodeById,
    createNewNode,
} from '../../controller/nodes.controler.js';

const dataLosgRouter = Router();

dataLosgRouter.route('').get(async (req, res, next) => {
    console.log((req.query.params as string).split(','));

    res.end();
});

dataLosgRouter.route('/:id').get().put();

export default dataLosgRouter;
