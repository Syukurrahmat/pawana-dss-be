import { Router } from 'express';
import {
    searchGoupWithSubsStatus,
    searchUsersWithSubsStatus,
} from '../../controller/search.controller.js';
import db from '../../models/index.js';
import { parseQueries } from '../../utils/utils.js';

// ================== /api/search/* ==================

const searchRouter = Router();

searchRouter.get('/users', searchUsersWithSubsStatus);
searchRouter.get('/groups', searchGoupWithSubsStatus);
searchRouter.get('/groups/:id/nodes', async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    try {
        const group = await db.Groups.findOne({
            where: { groupId: req.params.id },
            attributes: ['groupId'],
        });

        if (!group) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const nodes = await group.getNodes({
            where: { ...search },
            attributes: ['name', 'nodeId'],
            order: order,
            limit,
            offset,
        });

        const count = await group.countNodes({ where: { ...search } });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes,
        });
    } catch (error) {}
});

export default searchRouter;
