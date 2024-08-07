import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/sequelize';
import Reports from '../../models/reports';
import { ImgbbService } from '../../services/imbgg/imgbb.service';
import { FindReportDto } from './dto/find-report.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Reports)
        private reportDB: typeof Reports,
        private imgbbService: ImgbbService
    ) { }

    async create(userId: number, createReportDto: CreateReportDto) {
        const { images, coordinate, message, rating } = createReportDto

        const imageUrl = images ? await this.imgbbService.uploadPhotos(images!) : undefined
        const report = await this.reportDB.create({
            userId,
            message: message!,
            coordinate: coordinate!,
            rating: rating!,
            images: imageUrl
        })

        if (!report) throw new UnprocessableEntityException('Gagal, Ada yang salahh');

        return 'Berhasil menambahkan Aduan'
    }

    findAll(findReportDto: FindReportDto) {
        const { date, nearCompany, distance } = findReportDto
        // const { tz: timezone } = req.session

        // const momentCurrentDate = moment()
        // const currentDate = momentCurrentDate.format('YYYY-MM-DD')
        // const requestedDate = moment(date, "YYYY-MM-DD", true).isValid() ? date : currentDate

        // const nearCompanyId = parseInt(nearCompany) || null
        // const distancefromCompany = parseInt(distance) || 250

        // const isToday = requestedDate === currentDate

        // let filterByDistance: Where;

        // if (nearCompanyId && (await req.user?.hasCompany(nearCompanyId) || req.user?.role == 'admin')) {
        //     const company = await db.Companies.findByPk(nearCompany, { attributes: ['coordinate'] })
        //     if (!company) return next()

        //     const { coordinate: [latitude, longitude] } = company

        //     filterByDistance = db.sequelize.where(
        //         db.sequelize.fn(
        //             'ST_Distance_Sphere',
        //             db.sequelize.col('coordinate'),
        //             db.sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`)
        //         ),
        //         { [Op.lte]: distancefromCompany }
        //     )
        // }


        // const convertedCreatedAtCol = `DATE(CONVERT_TZ(Reports.createdAt, '+00:00', '${moment().format('Z')}'))`

        // const filterByDate = isToday ?
        //     { createdAt: { [Op.between]: [moment(momentCurrentDate).subtract(1, 'd').toDate(), momentCurrentDate.toDate()] } }
        //     : db.sequelize.literal(`${convertedCreatedAtCol} = '${requestedDate}'`)


        // const reports = await db.Reports.findAll({
        //     //@ts-ignore
        //     where: { [Op.and]: [filterByDate, filterByDistance] },
        //     include: [{
        //         model: db.Users,
        //         attributes: ['name', 'userId', 'profilePicture']
        //     }]
        // })

        // const prevNextDateOpt = [{ sign: '<', sort: 'DESC' }, { sign: '>', sort: 'ASC' }]

        // const [prevDate, nextDate] = await Promise.all((prevNextDateOpt.map(({ sign, sort }) => (
        //     db.Reports.findOne({
        //         attributes: [
        //             [db.sequelize.literal(convertedCreatedAtCol), 'date']
        //         ],
        //         where: db.sequelize.literal(`${convertedCreatedAtCol} ${sign} '${requestedDate}'`),
        //         order: [['createdAt', sort]],
        //     }).then(e => e ? e.getDataValue('date') : null)
        // ))))

        // return res.json({
        //     success: true,
        //     pagination: {
        //         previous: prevDate,
        //         current: requestedDate,
        //         next: (nextDate || isToday) ? nextDate : currentDate,
        //     },
        //     result: reports,
        // })


    }

}
