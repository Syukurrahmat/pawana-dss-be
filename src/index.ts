// import sinon from 'sinon';

// sinon.useFakeTimers({
//     now: new Date('2024-03-16T17:30:00.000Z').getTime(),
//     shouldAdvanceTime: false,
// });

// =======================
import 'dotenv/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import apiRouter from './routers/api/index.js';
import './auth/localStrategy.js';
import authRouter from './routers/auth/index.js';
import appRouter from './routers/app/index.js';
import path from 'path';
import db from './models/index.js';
import delay from 'express-delay';
import { isAuthenticated } from './middleware/userAccess.js';
import moment from 'moment';
import { Op } from 'sequelize';


const port = process.env.PORT || 3000;
const app = express();

app.use(delay(1000));


app.use(cors({ origin: '*', optionsSuccessStatus: 200, credentials: true }));

app.use(express.static(path.resolve('public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(
    session({
        secret: process.env.SESSION_SECRETKEY,
        resave: false,
        saveUninitialized: false,
    })
);

 


// db.Reports.findOne({
//     attributes: [
//         [
//             db.sequelize.literal(
//                 `DISTINCT(DATE(CONVERT_TZ(createdAt, '+00:00', '${'+07:00'}')))`
//             ),
//             'date'
//         ]
//     ],
//     order: [['createdAt', 'DESC']],
//     where: db.sequelize.where(
//         db.sequelize.literal(`DATE(CONVERT_TZ(createdAt, '+00:00', '${'+07:00'}'))`),
//         Op.ne,
//         currentDate
//     ),
//     limit: 1,
//     offset: (3000 - 1),
//     raw: true,
// }).then(e => console.log(e))

app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/app', appRouter);

app.get('/login', (req, res, next) => {
    console.log('jsjsjsjsjsj')
    res.sendFile(path.resolve('public/login.html'))
});

app.get(
    '/*',
    isAuthenticated,
    (req, res, next) => {
        console.log('ssjsjsj')
        next()
    },

);






app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something broke!' });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});




// let [latitude, longitude] = [-7.5265061, 110.08304936]

// let distance = 1000

// const distanceSphereQuery = (lat: number, lng: number) => (
//     `ST_Distance_Sphere(coordinate, POINT(${lng}, ${lat}))`
// )

// db.Reports.findAll({
//     attributes: {
//         include: [
//             [
//                 db.sequelize.literal(distanceSphereQuery(latitude, longitude)),
//                 'distance'
//             ]
//         ]
//     },
//     where: db.sequelize.literal(`${distanceSphereQuery(latitude, longitude)} <= ${distance}`)
// }).then(reports => {
//     console.log(reports);
// });
