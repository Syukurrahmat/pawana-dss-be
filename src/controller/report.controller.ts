import { getTimeZoneOffsetString } from '../utils/utils.js';
import db from '../models/index.js';
import moment from 'moment';
import { Op } from 'sequelize';
import { ControllerType } from '../types/index.js';
import { uploadPhotos as uploadPhotosToImgbb } from '../services/imgbb.js';


export const getCurrentReport: ControllerType = async (req, res, next) => {
    let date = req.query.date as string
    let timezoneOffset = req.query.timezoneOffset as string;

    console.log(date)

    const { offsetUTC, timeZone } = getTimeZoneOffsetString(timezoneOffset);
    const momentCurrDate = moment().utcOffset(-offsetUTC).format('YYYY-MM-DD')

    date = moment(date, "YYYY-MM-DD", true).isValid() ? date : momentCurrDate

    const reports = await db.Reports.findAll({
        where: db.sequelize.literal(`DATE(CONVERT_TZ(\`Reports\`.\`createdAt\`, '+00:00', '${timeZone}')) = '${date}'`),
        include: [{
            model: db.Users,
            attributes: ['name', 'userId', 'profilePicture']
        }]
    })

    const [prevDate, nextDate] = await Promise.all((['<', '>'].map(sign => (
        db.Reports.findOne({
            attributes: [
                [
                    db.sequelize.literal(
                        `DATE(CONVERT_TZ(createdAt, '+00:00', '${timeZone}'))`
                    ),
                    'date'
                ]
            ],
            where: db.sequelize.literal(`DATE(CONVERT_TZ(\`createdAt\`, '+00:00', '${timeZone}')) ${sign} '${date}'`),
            order: [['createdAt', 'DESC']],
        }).then(e => e ? e.getDataValue('date') : null)
    ))))

    return res.json({
        success: true,
        pagination: {
            previous: prevDate,
            current: date,
            next: nextDate,
        },
        result: reports,
    })

};

export const getCurrentsReport: ControllerType = async (req, res, next) => {
    let page = parseInt(req.query.page as string)
    page = page && page > 0 ? page : 0

    const offsetQuery = req.query.timezoneOffset as string;
    const { offsetUTC, timeZone } = getTimeZoneOffsetString(offsetQuery);

    const momentCurrDate = moment().utcOffset(-offsetUTC).format('YYYY-MM-DD')

    const currentDate = page ? await getDate(page) : momentCurrDate
    const nextDate = await getDate(page + 1)
    const previousPage = page == 1 ? momentCurrDate : page > 1 ? await getDate(page - 1) : null


    let reports = page == 0
        ? await db.Reports.findAll({
            where: {
                createdAt: {
                    [Op.gte]: moment().subtract(1, 'days').toDate()
                }
            },
            include: [{
                model: db.Users,
                attributes: ['name', 'userId', 'profilePicture']
            }]
        })
        : currentDate ?
            await db.Reports.findAll({
                where: db.sequelize.where(
                    db.sequelize.literal(`DATE(CONVERT_TZ(\`Reports\`.\`createdAt\`, '+00:00', '${timeZone}'))`),
                    Op.eq,
                    currentDate
                ),
                include: [{
                    model: db.Users,
                    attributes: ['name', 'userId', 'profilePicture']
                }]
            })
            : []


    return res.json({
        success: true,
        pagination: {
            previous: {
                page: previousPage ? page - 1 : null,
                date: previousPage
            },
            current: {
                page: page,
                date: currentDate
            },
            next: {
                page: nextDate ? page + 1 : null,
                date: nextDate
            },
        },
        result: reports,
    })



    function getDate(page: number) {
        return (
            db.Reports.findOne({
                attributes: [
                    [
                        db.sequelize.literal(
                            `DISTINCT(DATE(CONVERT_TZ(createdAt, '+00:00', '${timeZone}')))`
                        ),
                        'date'
                    ]
                ],
                order: [['createdAt', 'DESC']],
                where: db.sequelize.where(
                    db.sequelize.literal(`DATE(CONVERT_TZ(createdAt, '+00:00', '${timeZone}'))`),
                    Op.ne,
                    momentCurrDate
                ),
                limit: 1,
                offset: (page - 1),
                raw: true,
            }).then(e => e ? e.date : null)
        );
    }

};


export const createReport: ControllerType = async (req, res, next) => {
    const { images, coordinate, message, rating } = req.body

    try {
        const imageUrl = await uploadPhotosToImgbb(images)

        let report = await db.Reports.create({
            userId: 3,
            message,
            coordinate,
            rating,
            images: imageUrl.join('\n')
        })

        if (!report) return res.json({ success: false, message: 'Gagal, Ada yang salahh' })

        res.json({ success: true, message: 'Berhasil menambahkan Laporan' })

    } catch (error) { next(error) }
}
