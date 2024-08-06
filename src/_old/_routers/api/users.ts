import { Router } from 'express';
import { addNodeSubscription, createNewUser, deleteNodeSubscription, editUserProfile, getManagedCompanies, getSubscribedNodes, getAllUsers, getUser, getUsersSummary, editUserPassword, getRemainingSubsLimit, getOwnNodes, getOwnNodesSummary } from '../../_controller/users.controler.js';
import { dashboardDataForRegularUser } from '../../_controller/dashboard.controller.js';
import { ControllerType, UserRole } from '../../_types/index.js';
import { check, body, query, validationResult } from 'express-validator'
import { Op, OrderItem } from 'sequelize';
import db from '../../_models/index.js';

const usersRouter = Router();

const UsePagination: () => ControllerType[] = () => [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be an integer greater than 0'),

    query('limit')
        .optional()
        .isInt({ min: 10, max: 100 })
        .withMessage('Limit must be an integer greater than 0'),

    query('q')
        .optional()
        .isString()
        .withMessage('Search must be a string'),

    query('sort')
        .optional()
        .isString()
        .withMessage('Search must be a string'),

    query('order')
        .optional()
        .isIn(['asc', 'desc', 'ASC', 'DESC'])
        .withMessage('Order must be either asc, ASC, desc, or DESC'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(e => e.msg) });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const searchQuery = req.query.q as string;
        const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

        const sort = req.query.sort as string
        const order = req.query.order as string || 'ASC'

        const orderItem: OrderItem[] = sort ? [[db.sequelize.col(sort), order]] : []

        req.pagination = {
            page,
            limit,
            offset: (page - 1) * limit,
            search: searchObj,
            order: orderItem,
        };

        next();
    },
]




const RoleIs: (r: UserRole | UserRole[]) => ControllerType = (roles) => (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    console.log(req.user?.role)

    if (!allowedRoles.includes(req.user?.role!)) {
        return res.status(401).send('Unauthorized')
    }

    next()
}


usersRouter.get(
    '/',
    RoleIs(['admin', 'gov']),
    UsePagination(),
    (req, res, next) => {

        res.send('djdjdjdj')
        // getAllUsers(req.pa)
    }
)

usersRouter.route('/')
    .get(getAllUsers)
    .post(createNewUser)

usersRouter.get('/summary', getUsersSummary);

usersRouter.route('/:id')
    .get(getUser)
    .put(editUserProfile);

usersRouter.get('/:id/dashboard', dashboardDataForRegularUser)
usersRouter.get('/:id/remaining-subs-limit', getRemainingSubsLimit)

usersRouter.put('/:id/password', editUserPassword)

usersRouter.route('/:id/nodes')
    .get(getSubscribedNodes)
    .post(addNodeSubscription)
    .delete(deleteNodeSubscription)

usersRouter.get('/:id/own-nodes/summary', getOwnNodesSummary)

usersRouter.route('/:id/own-nodes')
    .get(getOwnNodes)



usersRouter.route('/:id/companies')
    .get(getManagedCompanies)

export default usersRouter;
