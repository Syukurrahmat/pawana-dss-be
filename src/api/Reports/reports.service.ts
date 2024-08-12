import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/sequelize';
import Reports from '../../models/reports';
import { ImgbbService } from '../../services/Imgbb.service';
import { FindReportDto } from './dto/find-report.dto';
import moment from 'moment';
import { Where } from 'sequelize/types/utils';
import Companies from '../../models/companies';
import { UserRole } from '../../types';
import Users from '../../models/users';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class ReportsService {
    private formateDate = 'YYYY-MM-DD'
    constructor(
        @InjectModel(Reports)
        private reportDB: typeof Reports,
        @InjectModel(Companies)
        private companiesDB: typeof Companies,
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

    async findAll(user: Users, findReportDto: FindReportDto, tz: string) {
        const { date, nearCompany, distance = 250 } = findReportDto


        const momentCurrentDate = moment.tz(tz)
        const currentDate = momentCurrentDate.format(this.formateDate)
        const requestedDate = moment(date, this.formateDate, true).isValid()
            ? moment.tz(date, tz).format(this.formateDate)
            : currentDate

        const distancefromCompany = distance || 250
        const isToday = requestedDate === currentDate

        let filterByDistance: Where | undefined = undefined

        if (nearCompany) {
            const isOwn = user.role == 'admin' || user.role == 'gov' || await user.hasCompanies([nearCompany])
            if (!isOwn) throw new BadRequestException()

            const company = await this.companiesDB.findByPk(nearCompany, { attributes: ['coordinate'] })
            if (!company) throw new NotFoundException()

            const { coordinate: [latitude, longitude] } = company

            filterByDistance = Sequelize.where(
                Sequelize.fn(
                    'ST_Distance_Sphere',
                    Sequelize.col('coordinate'),
                    Sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`)
                ),
                { [Op.lte]: distancefromCompany }
            )

        }
        const convertedCreatedAtCol = `DATE(CONVERT_TZ(Reports.createdAt, '+00:00', '${moment.tz(tz).format('Z')}'))`

        const filterByDate = isToday ?
            { createdAt: { [Op.between]: [moment(momentCurrentDate).subtract(1, 'd').toDate(), momentCurrentDate.toDate()] } }
            : Sequelize.literal(`${convertedCreatedAtCol} = '${requestedDate}'`)

        const reports = await this.reportDB.findAll({
            //@ts-ignore
            where: { [Op.and]: [filterByDate, filterByDistance] },
            include: [{
                model: Users,
                attributes: ['name', 'userId', 'profilePicture']
            }]
        })

        const prevNextDateOpt = [{ sign: '<', sort: 'DESC' }, { sign: '>', sort: 'ASC' }]

        const [prevDate, nextDate] = await Promise.all((prevNextDateOpt.map(({ sign, sort }) => (
            this.reportDB.findOne({
                attributes: [
                    [Sequelize.literal(convertedCreatedAtCol), 'date']
                ],
                where: Sequelize.literal(`${convertedCreatedAtCol} ${sign} '${requestedDate}'`),
                order: [['createdAt', sort]],
            }).then(e => e ? e.getDataValue('date') : null)
        ))))

        return {
            pagination: {
                previous: prevDate,
                current: requestedDate,
                next: (nextDate || isToday) ? nextDate : currentDate,
            },
            result: reports,
        }
    }
}
