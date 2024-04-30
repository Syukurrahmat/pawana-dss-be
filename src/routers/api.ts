import { Router } from 'express';
import dashboardData from './dashboardData.js';
import db from '../models/index.js';
import usersRouter from './api/users.js';
// import { sendVerificationEmail } from '../utils/email.js';

const router = Router();

router.use(usersRouter); // api/users/*

router.get('/groups', (req, res) => {
    db.Groups.findAll({
        attributes: { exclude: ['name', 'groupId', 'address', 'updatedAt'] },
        limit: 30,
        include: {
            model: db.Users,
            through: { where: { requestStatus: 'approved' } },
            attributes: ['userId'],
        },
    }).then((groups) => {
        res.json(
            groups.map(({ name, groupId, address, users }) => ({
                groupId,
                name,
                address,
                subscriptionCount: users.length,
            }))
        );
    });
});

router
    .route('/groups/:id')
    .get((req, res) => {
        db.Users.findOne({ where: { userId: req.params.id } })
            .then((e) => {
                res.json(e);
            })
            .catch(() => {
                res.status(500).json();
            });
    })
    .post((req) => {
        console.log(req.params.id);
    })
    .put((req) => {
        console.log(req.params.id);
    })
    .delete((req) => {
        console.log(req.params.id);
    });

router.get('/dashboard/data', async (req, res) => {
    res.json(await dashboardData());
});

export default router;

// const password = randomstring.generate(10);
//         const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//         console.log(password);
//         console.log(hashedPassword);
