import { Router } from 'express';
import db from '../../models/index.js';
import { buildQuery } from '../../utils/utils.js';

const nodesRouter = Router();

nodesRouter
    .route('')
    .get(async (req, res, next) => {
        const { page, limit, search, order } = buildQuery(req, {
            searchField: 'name',
            sortOpt: ['name', 'createdAt'],
        });

        // Fetch data from DB
        try {
            const { count, rows: nodes } = await db.Nodes.findAndCountAll({
                attributes: ['nodeId', 'name', 'longitude', 'latitude', 'status', 'environment'],
                where: { ...search },
                order,
                offset: (page - 1) * limit,
                limit,
                include: [
                    {
                        model: db.DataLogs,
                        order: [['datetime', 'desc']],
                        limit: 1,
                        attributes: ['datetime'],
                    },
                    {
                        model: db.Groups,
                        attributes: ['groupId', 'name'],
                    },
                ],
            });

            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: nodes
                    .map((e) => e.toJSON())
                    .map(({ data, ...rest }) => ({
                        ...rest,
                        lastUpdateAt: data[0] ? data[0].datetime : null,
                    })),
            });
        } catch (e) {
            next(e);
        }
    })

    .post((req, res, next) => {
        const { name, description, address } = req.body;
        db.Groups.create({
            name,
            description,
            address,
        })
            .then((e) => {
                res.json({
                    success: true,
                    message: 'Grup berhasil dibuat',
                    result: {
                        groupId: e.groupId,
                    },
                });
            })

            .catch(next);
    })
    .put(async (req, res, next) => {
        const { name, address, description, groupId } = req.body;

        console.log({
            name,
            description,
        });

        db.Groups.update(
            {
                name,
                description,
                address,
            },
            { where: { groupId } }
        )
            .then(([n]) => {
                if (n) {
                    res.json({
                        success: true,
                        message: 'Berhasil diperbarui',
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Gagal diperbarui',
                    });
                }
            })
            .catch(next);
    });

nodesRouter.get('/:id', (req, res, next) => {
    db.Groups.findOne({
        where: { groupId: req.params.id },
    })
        .then((e) => {
            if (!e) {
                res.json({
                    success: false,
                    message: 'Grup tidak ditemukan',
                });
                return;
            }
            res.json({ success: true, result: e.toJSON() });
        })
        .catch(next);
});

export default nodesRouter;
