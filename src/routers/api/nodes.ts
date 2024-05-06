import { Router } from 'express';
import db from '../../models/index.js';
import { buildQuery } from '../../utils/utils.js';
import { v4 as uuidV4 } from 'uuid';

const nodesRouter = Router();

nodesRouter
    .route('')
    .get(async (req, res, next) => {
        const { page, limit, search, order, offset } = buildQuery(req, {
            searchField: 'name',
            sortOpt: ['name', 'createdAt'],
        });

        // Fetch data from DB

        try {
            const { count, rows: nodes } = await db.Nodes.findAndCountAll({
                attributes: { exclude: ['description', 'apiKey', 'updatedAt'] },
                where: { ...search },
                order,
                offset,
                limit,
                include: {
                    model: db.Groups,
                    attributes: ['groupId', 'name'],
                },
            });

            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: nodes.map((e) => e.toJSON()),
            });
        } catch (e) {
            next(e);
        }
    })

    .post((req, res, next) => {
        const { name, description, status, environment, latitude, longitude, groupId } = req.body;

        db.Nodes.create({
            name,
            description,
            status,
            environment,
            latitude,
            longitude,
            groupId,
            apiKey: uuidV4(),
        })
            .then(() => {
                res.json({
                    success: true,
                    message: 'Node Berhasil dibuat',
                });
            })
            .catch(next);
    })

    .put(async (req, res, next) => {
        const { name, description, nodeId, longitude, latitude } = req.body;

        console.log({
            name,
            description,
        });

        db.Nodes.update(
            {
                name,
                description,
                longitude,
                latitude,
            },
            { where: { nodeId } }
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
    db.Nodes.findOne({
        where: { nodeId: req.params.id },
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
