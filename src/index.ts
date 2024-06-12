import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import moment, { Moment } from 'moment-timezone';
import passport from 'passport';
import path from 'path';
import './auth/localStrategy.js';
import db from './models/index.js';
import apiRouter from './routers/api/index.js';
import authRouter from './routers/auth/index.js';
import { ControllerType } from './types/index.js';
import { groupByInterval } from './utils/common.utils.js';

const port = process.env.PORT || 3000;
const app = express();


// db.sequelize.sync().then(e=>console.log(e))


app.use(cors());

app.use(
    session({
        secret: process.env.SESSION_SECRETKEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);


const mySession: ControllerType = async (req, res, next) => {
    if (req.session.activeDashboard === undefined) {
        req.session.activeDashboard = 'companySubs'
    }
    if (req.session.activeCompany === undefined) {
        const userHasCompany = await req.user.countCompanies()
        const activeCompany = userHasCompany ? (await req.user.getCompanies({ attributes: ['companyId', 'coordinate', 'name', 'type',], limit: 1 })).at(0) : null

        req.session.activeCompany = activeCompany
    }
    if (req.session.tz === undefined) req.session.tz = 'Asia/Bangkok'

    moment.tz.setDefault(req.session.tz)

    next()
}


app.use(express.static(path.resolve('public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(async (req, res, next) => {
    req.user = await db.Users.findByPk(215)
    next()
})


app.use(passport.initialize());
app.use(passport.session());

app.use('/api', mySession, apiRouter);
app.use('/auth', authRouter);






app.get('/login', (req, res, next) => {
    res.sendFile(path.resolve('public/login.html'))
});




app.get('/*', createProxyMiddleware({
    target: 'http://localhost:5173/',
    changeOrigin: true,
}))



app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: 'Something broke!', error: err });
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

function getRandomItem(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

const updatedatetimeDatalogs = async () => {
    let lastDate = (await db.DataLogs.findOne({ order: [['datetime', 'DESC']] })).datetime
    let diff = moment().diff(lastDate, 'millisecond')
    let datalogs = await db.DataLogs.findAll()

    for (let i = 0; i < datalogs.length; i++) {
        const dlogs = datalogs[i];
        let { datetime } = dlogs
        dlogs.datetime = moment(datetime).add(diff, 'millisecond').subtract(15, 'minutes').toDate()

        await dlogs.save()
        console.log(i + 1, '/', datalogs.length)
    }

    console.log('selesai')


    let nodes = await db.Nodes.findAll()

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        let datalog = await db.DataLogs.findOne({ where: { nodeId: node.nodeId }, order: [['datetime', 'desc']] })

        if (datalog) {

            node.lastDataSent = datalog.datetime
            await node.save()

            console.log(datalog.datetime)
        }


    }

    console.log('selesai')


}




