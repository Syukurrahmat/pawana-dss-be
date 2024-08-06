import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import moment from 'moment-timezone';
import passport from 'passport';
import path from 'path';
import { Op } from 'sequelize';
import './auth/localStrategy.js';
import { isAuthenticated, userSessionData } from './middleware/index.middleware.js';
import db from './models/index.js';
import apiRouter from './routers/api/index.js';
import authRouter from './routers/auth/index.js';

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(
    session({
        secret: process.env.SESSION_SECRETKEY as string,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.use(express.static(path.resolve('public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// ============================= FOR DEVELOPMENT ONLY ============================================


const USERACTIVE_DEV = 53

if (USERACTIVE_DEV) {
    app.use(async (req, res, next) => {
        req.user = (await db.Users.findByPk(USERACTIVE_DEV))!
        next()
    })
}

// =================================================================================================

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', isAuthenticated, userSessionData, apiRouter);
app.use('/auth', authRouter);

app.get('/login', (req, res, next) => {
    res.sendFile(path.resolve('public/index.login.html'))
});

// app.get('/*', isAuthenticated, (req, res, next) => {
//     res.sendFile(path.resolve('public/index.app.html'))
// });

app.get('/*', isAuthenticated, createProxyMiddleware({
    target: 'http://localhost:5173/',
    changeOrigin: true,
}))



app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: 'Something broke!', error: err });
});


app.listen(port, () => console.log(`Server running at http://localhost:${port}`));



// ============================= FOR DEVELOPMENT ONLY ============================================

const updatedatetimeDatalogs = async (nodeIds?: number[]) => {
    let startTime = moment()


    if (!nodeIds?.length) {


        const user = await db.Users.findByPk(USERACTIVE_DEV)
        const gg = (await user!.getSubscribedNodes()).map(e => e.nodeId)
        //@ts-ignore
        const companies = await user.getCompanies()

        const subsNodes = (await Promise.all(companies.map(e => e.getSubscribedNodes()))).flatMap(e => e).map(e => e.nodeId)
        const ownNodes = (await Promise.all(companies.map(e => e.getPrivateNodes()))).flatMap(e => e).map(e => e.nodeId)


        nodeIds = [...new Set([...subsNodes, ...ownNodes, ...gg])] as number[]
    }

    console.log(nodeIds)

    // return 


    const nodes = await db.Nodes.findAll({
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



    let allNodes = await db.Nodes.findAll()

    for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];

        let datalog = await db.DataLogs.findOne({ where: { nodeId: node.nodeId }, order: [['datetime', 'desc']] })

        if (datalog) {

            node.lastDataSent = datalog.datetime
            await node.save()

            console.log(datalog.datetime)
        }
    }
    console.log('selesai dalam ' + moment().diff(startTime, 'seconds') + ' detik')
}




// updatedatetimeDatalogs()



const kk = async () => {

    // for (let i = 0; i < array.length; i++) {
    //     const [nodeId, start, end] = array[i];

    let dts = await db.DataLogs.findAll({
        where: {
            nodeId: 69,
            // datetime: { [Op.between]: [new Date(start), new Date(end)] },

        },
        order: [['datetime', 'DESC']]
    })

    const lastDate = dts.at(0)?.datetime!
    let diff = moment().diff(lastDate, 'millisecond')

    for (let i = 0; i < dts.length; i++) {
        const dt = dts[i];


        dt.datetime = moment(dt.datetime).add(diff, 'milliseconds').toDate()

        await dt.save()
    }



    // await db.DataLogs.bulkCreate(dts.map(e => e.toJSON()).map(({ dataLogId, ...e }) => ({ ...e, nodeId: nodeId as number })))
    console.log(22)

    // }
}

let [min_co2, max_co2, min_ch4, max_ch4, min_pm100, max_pm100, min_pm25, max_pm25] = [
    203, 1900, 820, 14751, 0.1, 6.55, 0.1, 6.55
]
let [min_co2_old, max_co2_old, min_ch4_old, max_ch4_old, min_pm100_old, max_pm100_old, min_pm25_old, max_pm25_old] = [
    203, 11362, 820, 19751, 0.1, 6.55, 0.1, 6.55
]


function scaleValue(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number,) {
    if (oldMin === oldMax) {
        throw new Error("Rentang lama tidak boleh nol.");
    }
    const scaledValue = ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;

    return scaledValue;
}


const scaleValueDatalogs = async () => {

    const user = await db.Users.findByPk(USERACTIVE_DEV)
    const gg = (await user!.getSubscribedNodes()).map(e => e.nodeId)
    //@ts-ignore
    const companies = await user.getCompanies()

    const subsNodes = (await Promise.all(companies.map(e => e.getSubscribedNodes()))).flatMap(e => e).map(e => e.nodeId)
    const ownNodes = (await Promise.all(companies.map(e => e.getPrivateNodes()))).flatMap(e => e).map(e => e.nodeId)


    const nodeIds = [...new Set([...subsNodes, ...ownNodes, ...gg])] as number[]



    const datalogs = await db.DataLogs.findAll({
        where: {
            nodeId: { [Op.in]: nodeIds.filter(e => e !== 74) },
        }
    })


    console.log('Mulai Slurrr')

    for (let i = 0; i < datalogs.length; i++) {
        const dt = datalogs[i];

        // dt.pm100 = scaleValue(dt.pm100, min_pm100_old, max_pm100_old, min_pm100, max_pm100)
        // dt.pm25 = scaleValue(dt.pm25, min_pm25_old, max_pm25_old, min_pm25, max_pm25)
        // dt.co2 = scaleValue(dt.co2, min_co2_old, max_co2_old, min_co2, max_co2)
        dt.ch4 = scaleValue(dt.ch4, min_ch4_old, max_ch4_old, min_ch4, max_ch4)

        await dt.save()


        if (i % 10 == 0) {
            console.log(i, '/', datalogs.length)

        }
    }

}
// scaleValueDatalogs()




// db.DataLogs.findAll({ where: { nodeId: 54 } }).then(async (array) => {
//     for (let i = 0; i < array.length; i++) {
//         const element = array[i];

//         element.ch4  = element.ch4  + 150
//         await element.save()

//         console.log(i , array.length)

//     }
// })

// db.Nodes.findOne({ where: { nodeId: 1 } }).then(node => {
//     if (node) {
//         console.log(node.instalationDate)
//         node.instalationDate = moment().tz('Asia/bangkok').toDate()

//         console.log(moment().tz('Asia/bangkok').toDate())
//         console.log(moment(node.getDataValue('instalationDate')).toJSON())


//         // console.log(node?.toJSON())
//     }
// })






