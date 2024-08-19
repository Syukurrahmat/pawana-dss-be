import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, Request, urlencoded } from 'express';
import session from 'express-session';
import moment from 'moment';
import passport from 'passport';
import { Op } from 'sequelize';
import sessionstore from 'sessionstore';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/transformInterceptor';
import DataLogs from './models/datalogs';
import Nodes from './models/nodes';
import Users from './models/users';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('Cats example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('Users')
        .addTag('Users subscription')
        .addTag('Companies')
        .addTag('Companies subscription')
        .addTag('Eventlogs')
        .addTag('Reports')
        .addTag('Nodes')
        .addTag('Nodes subscriber')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document, {
        jsonDocumentUrl: 'swagger/json',
    });

    app.use(
        session({
            secret: 'my-secret',
            resave: false,
            store: sessionstore.createSessionStore(),
            saveUninitialized: false,
            cookie: { maxAge: 3600000 }
        }),
    );

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    app.use(passport.initialize())
    app.use(passport.session())


    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.useGlobalInterceptors(new ResponseInterceptor())



    app.useGlobalFilters(new NotFoundExceptionFilter());
    app.use(async (req: Request, res, next) => {
        req.user = await Users.findByPk(53) || undefined
        // req.user = await Users.findByPk(10) || undefined
        next()
    })



    // await updatedatetimeDatalogs(6)

    await app.listen(3000)
}

bootstrap();



// ============================= FOR DEVELOPMENT ONLY ============================================

const updatedatetimeDatalogs = async (USERACTIVE_DEV: number, nodeIds?: number[]) => {
    let startTime = moment()


    if (!nodeIds?.length) {
        const user = await Users.findByPk(USERACTIVE_DEV)
        const gg = (await user!.getSubscribedNodes()).map(e => e.nodeId)
        //@ts-ignore
        const companies = await user.getCompanies()

        const subsNodes = (await Promise.all(companies.map(e => e.getSubscribedNodes()))).flatMap(e => e).map(e => e.nodeId)
        const ownNodes = (await Promise.all(companies.map(e => e.getPrivateNodes()))).flatMap(e => e).map(e => e.nodeId)


        nodeIds = [...new Set([...subsNodes, ...ownNodes, ...gg])] as number[]
    }

    console.log(nodeIds)

    // return 

    const nodes = await Nodes.findAll({
        where: {
            nodeId: {
                [Op.and]: [
                    { [Op.in]: nodeIds! },
                    { [Op.ne]: 74 }
                ]
            }
        }
    })


    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const datalogs = await node.getDataLogs({ order: [['datetime', 'DESC']] })

        let lastDate = datalogs[0]?.datetime

        if (!lastDate) continue

        let diff = moment().diff(lastDate, 'millisecond')

        for (let j = 0; j < datalogs.length; j++) {
            const dt = datalogs[j];

            dt.datetime = moment(dt.datetime).add(diff, 'milliseconds').toDate()

            await dt.save()

            if (j % 200 == 0) console.log('node ke ', i + 1, 'dari', nodes.length, '=>', (j / datalogs.length) * 100, '%')
        }
    }


    console.log('selesai')



    let allNodes = await Nodes.findAll()

    for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];

        let datalog = await DataLogs.findOne({ where: { nodeId: node.nodeId }, order: [['datetime', 'desc']] })

        if (datalog) {

            node.lastDataSent = datalog.datetime
            await node.save()

            console.log(datalog.datetime)
        }
    }
    console.log('selesai dalam ' + moment().diff(startTime, 'seconds') + ' detik')
}

import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const proxy = createProxyMiddleware({
            target: 'http://localhost:5173', // Ganti dengan port Vite development server
            changeOrigin: true,
        });

        proxy(request, response, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                response.status(500).send('Internal server error');
            }
        });
    }
}

