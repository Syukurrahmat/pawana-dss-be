// import sinon from 'sinon';

// sinon.useFakeTimers({
//     now: new Date('2024-03-16T17:30:00.000Z').getTime(),
//     shouldAdvanceTime: false,
// });

// =======================
import 'dotenv/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import passport, { use } from 'passport';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import apiRouter from './routers/api/index.js';
import './auth/localStrategy.js';
import path from 'path';
import { isAuthenticated } from './middleware/userAccess.js';
import db from './models/index.js';
import authRouter from './routers/auth/index.js';
import { Op, where } from 'sequelize';

db.sequelize
    .sync()
    .then(() => console.log('Database tersingkorinisasi '))
    .catch((e) => console.error('Unable to connect to the database ' + e));

const port = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: 'http://localhost:5173', optionsSuccessStatus: 200 }));

app.use(express.static(path.resolve('public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    session({
        secret: process.env.SESSION_SECRETKEY,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.get('/login', (req, res, next) => res.sendFile(path.resolve('public/login.html')));

app.use(
    '/*',
    createProxyMiddleware({
        target: 'http://localhost:5173/',
        changeOrigin: true,
    })
);

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
