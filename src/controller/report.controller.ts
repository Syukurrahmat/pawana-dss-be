import db from '../models/index.js';
import moment from 'moment-timezone';
import { Op } from 'sequelize';
import { ControllerType, QueryOfSting } from '../types/index.js';
import { uploadPhotos as uploadPhotosToImgbb } from '../services/imgbb.js';
import { Where } from 'sequelize/lib/utils';

export const getReport: ControllerType = async (req, res, next) => {
    const { date, nearCompany, distance } = req.query as QueryOfSting
    const { tz: timezone } = req.session


    const momentCurrentDate = moment()
    const currentDate = momentCurrentDate.format('YYYY-MM-DD')
    const requestedDate = moment(date, "YYYY-MM-DD", true).isValid() ? date : currentDate

    const nearCompanyId = parseInt(nearCompany) || null
    const distancefromCompany = parseInt(distance) || 250

    const isToday = requestedDate === currentDate

    let filterByDistance: Where

    if (nearCompanyId && (await req.user.hasCompany(nearCompanyId) || req.user.role == 'admin')) {
        const { coordinate: [latitude, longitude] } = await db.Companies
            .findByPk(nearCompany, { attributes: ['coordinate'] })

        filterByDistance = db.sequelize.where(
            db.sequelize.fn(
                'ST_Distance_Sphere',
                db.sequelize.col('coordinate'),
                db.sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`)
            ),
            { [Op.lte]: distancefromCompany }
        )
    }


    const convertedCreatedAtCol = `DATE(CONVERT_TZ(Reports.createdAt, '+00:00', '${moment.tz(timezone).format('Z')}'))`

    console.log('convertedCreatedAtCol', convertedCreatedAtCol)

    const filterByDate = isToday ?
        { createdAt: { [Op.between]: [moment(momentCurrentDate).subtract(1, 'd').toDate(), momentCurrentDate.toDate()] } }
        : db.sequelize.literal(`${convertedCreatedAtCol} = '${requestedDate}'`)


    const reports = await db.Reports.findAll({
        where: { [Op.and]: [filterByDate, filterByDistance] },
        include: [{
            model: db.Users,
            attributes: ['name', 'userId', 'profilePicture']
        }]
    })

    console.log(reports)

    const prevNextDateOpt = [{ sign: '<', sort: 'DESC' }, { sign: '>', sort: 'ASC' }]

    const [prevDate, nextDate] = await Promise.all((prevNextDateOpt.map(({ sign, sort }) => (
        db.Reports.findOne({
            attributes: [
                [db.sequelize.literal(convertedCreatedAtCol), 'date']
            ],
            where: db.sequelize.literal(`${convertedCreatedAtCol} ${sign} '${requestedDate}'`),
            order: [['createdAt', sort]],
        }).then(e => e ? e.getDataValue('date') : null)
    ))))

    return res.json({
        success: true,
        pagination: {
            previous: prevDate,
            current: requestedDate,
            next: (nextDate || isToday) ? nextDate : currentDate,
        },
        result: reports,
    })

};



export const createReport: ControllerType = async (req, res, next) => {
    const { images, coordinate, message, rating } = req.body

    try {
        const imageUrl = await uploadPhotosToImgbb(images)

        let report = await db.Reports.create({
            userId: req.user.userId,
            message,
            coordinate,
            rating,
            images: imageUrl
        })

        if (!report) return res.json({ success: false, message: 'Gagal, Ada yang salahh' })

        res.json({ success: true, message: 'Berhasil menambahkan Aduan' })

    } catch (error) { next(error) }
}
