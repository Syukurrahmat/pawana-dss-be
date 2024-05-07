import db from '../models/index.js';
import { controllerType } from '../types/index.js';
import { parseQueries } from '../utils/utils.js';
import { v4 as uuidV4 } from 'uuid';

export const getAllNodes: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    // Fetch data from DB

    db.Nodes.findAndCountAll({
        attributes: { exclude: ['description', 'apiKey', 'updatedAt'] },
        where: { ...search },
        order,
        offset,
        limit,
        include: {
            model: db.Groups,
            attributes: ['groupId', 'name'],
        },
    })
        .then(({ count, rows: nodes }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: nodes.map((e) => e.toJSON()),
            });
        })
        .catch(next);
};

export const createNewNode: controllerType = async (req, res, next) => {
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
};

export const getNodeById: controllerType = async (req, res, next) => {
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
};
export const editNode: controllerType = async (req, res, next) => {
    const { name, description, longitude, latitude } = req.body;

    db.Nodes.update(
        {
            name,
            description,
            longitude,
            latitude,
        },
        { where: { nodeId: req.params.id } }
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
};
