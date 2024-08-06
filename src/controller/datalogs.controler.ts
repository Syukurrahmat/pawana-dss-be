import db from '../models/index.js';
import { Op } from 'sequelize';
import moment from 'moment-timezone'
import { ControllerType } from '../types/index.js';

export const getDownloadableNode: ControllerType = async (req, res, next) => {
    try {
        const user = await db.Users.findByPk(req.user!.userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        const { userId } = user;
        const companyIds = (await user.getCompanies({ attributes: ['companyId'] })).map(e => e.companyId);
        const result = await db.Nodes.findAll({
            attributes: ['nodeId', 'name'],
            include: [
                {
                    model: db.Users,
                    as: 'userSubscriptions',
                    attributes: [],
                    required: false,
                    where: { userId }
                },
                {
                    model: db.Companies,
                    attributes: ['name'],
                    through: { attributes: [] },
                    where: { companyId: { [Op.in]: companyIds } },
                    required: false,
                },
            ],
            where: {
                [Op.or]: [
                    { '$userSubscriptions.userId$': userId },
                    { '$companySubscriptions.companyId$': { [Op.in]: companyIds } }
                ]
            },
            order: [
                [db.sequelize.col('companySubscriptions.name'), 'ASC']
            ]
        });

        res.json({
            success: true,
            result: result.map((e => ({
                name: e.name,
                nodeId: e.nodeId,
                subscription: e.companySubscriptions!.at(0)?.name
            })))
        });


    } catch (error) { next(error); }
};


export const postDatafromSensor: ControllerType = async (req, res, next) => {
    const { apiKey, datetime, pm25, pm100, co2, ch4, temperature, humidity } = req.body;
    if (!(moment(datetime).isValid() && apiKey && pm25 && pm100 && co2 && ch4)) return res.status(400).send('awikwok om');

    const node = await db.Nodes.findOne({ where: { apiKey }, attributes: ['nodeId'] });
    if (!node) return res.status(404).send('awikwok om');

    const newDataLog = await node.createDataLog({
        datetime,
        pm25,
        pm100,
        co2,
        ch4,
        temperature,
        humidity
    });

    res.json({
        success: Boolean(newDataLog)
    });
};
