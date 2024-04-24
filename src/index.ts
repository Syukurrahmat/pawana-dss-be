import sinon from 'sinon';

sinon.useFakeTimers({
    now: new Date('2024-03-16T17:30:00.000Z').getTime(),
    shouldAdvanceTime: false,
});

// =======================
import 'dotenv/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import apiRouter from './routers/api.js';
import './auth/localStrategy.js';
import path from 'path';
import { isAuthenticated } from './middleware/userAccess.js';
import db from './models/index.js';

db.sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

const port = process.env.PORT || 3000;
const app = express();

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

app.route('/login')
    .get((req, res) => res.sendFile(path.resolve('public/login.html')))
    .post(
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login?failed=true',
        })
    );

app.use(
    '/*',
    createProxyMiddleware({
        target: 'http://localhost:5173/',
        changeOrigin: true,
    })
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// // Ubah email menjadi lowercase dan simpan perubahan
