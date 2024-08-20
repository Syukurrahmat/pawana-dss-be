import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, Request, urlencoded } from 'express';
import session from 'express-session';
import moment from 'moment';
import passport from 'passport';
import { Op } from 'sequelize';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './common/exception/notFoundException';
import { ResponseInterceptor } from './common/interceptor/transformInterceptor';
import { publicDir } from './lib/common.utils';
import { configureSwagger } from './lib/swagger';
import DataLogs from './models/datalogs';
import Nodes from './models/nodes';
import Users from './models/users';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(
        session({
            secret: 'my-secret',
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 3600000 },
        })
    );
    
    app.enableCors();
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new NotFoundExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useStaticAssets(publicDir());
    
    configureSwagger(app)
    
    app.use(async (req: Request, res, next) => {
        req.user = (await Users.findByPk(53)) || undefined;
        next();
    });

    // await updatedatetimeDatalogs(6)

    await app.listen(3000);
}

bootstrap();

// ============================= FOR DEVELOPMENT ONLY ============================================

const updatedatetimeDatalogs = async (USERACTIVE_DEV: number, nodeIds?: number[]) => {
    let startTime = moment();

    if (!nodeIds?.length) {
        const user = await Users.findByPk(USERACTIVE_DEV);
        const gg = (await user!.getSubscribedNodes()).map((e) => e.nodeId);
        //@ts-ignore
        const companies = await user.getCompanies();

        const subsNodes = (await Promise.all(companies.map((e) => e.getSubscribedNodes())))
            .flatMap((e) => e)
            .map((e) => e.nodeId);
        const ownNodes = (await Promise.all(companies.map((e) => e.getPrivateNodes())))
            .flatMap((e) => e)
            .map((e) => e.nodeId);

        nodeIds = [...new Set([...subsNodes, ...ownNodes, ...gg])] as number[];
    }

    console.log(nodeIds);

    // return

    const nodes = await Nodes.findAll({
        where: {
            nodeId: {
                [Op.and]: [{ [Op.in]: nodeIds! }, { [Op.ne]: 74 }],
            },
        },
    });

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const datalogs = await node.getDataLogs({ order: [['datetime', 'DESC']] });

        let lastDate = datalogs[0]?.datetime;

        if (!lastDate) continue;

        let diff = moment().diff(lastDate, 'millisecond');

        for (let j = 0; j < datalogs.length; j++) {
            const dt = datalogs[j];

            dt.datetime = moment(dt.datetime).add(diff, 'milliseconds').toDate();

            await dt.save();

            if (j % 200 == 0)
                console.log(
                    'node ke ',
                    i + 1,
                    'dari',
                    nodes.length,
                    '=>',
                    (j / datalogs.length) * 100,
                    '%'
                );
        }
    }

    console.log('selesai');

    let allNodes = await Nodes.findAll();

    for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];

        let datalog = await DataLogs.findOne({
            where: { nodeId: node.nodeId },
            order: [['datetime', 'desc']],
        });

        if (datalog) {
            node.lastDataSent = datalog.datetime;
            await node.save();

            console.log(datalog.datetime);
        }
    }
    console.log('selesai dalam ' + moment().diff(startTime, 'seconds') + ' detik');
};


