import { Router } from 'express';
import {
    editNode,
    getAllNodes,
    getNodeById,
    createNewNode,
} from '../../controller/nodes.controler.js';

const nodesRouter = Router();

nodesRouter.route('').get(getAllNodes).post(createNewNode);

nodesRouter.route('/:id').get(getNodeById).put(editNode);

nodesRouter.route('/:id/data').get(async (req, res, next) => {
    let { params, start, end } = req.query;

    






    if (!(params && start && end)){
        res.json({
            success : false, 
            message : "query params invalid"
        })
    }






    console.log(params, start, end);

    res.end();
});

export default nodesRouter;
