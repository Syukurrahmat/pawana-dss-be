import { Request, Response, NextFunction } from 'express';
import db from '../models/index.js';

type mdwareType = (req: Request, res: Response, next: NextFunction) => void;

export const isAuthenticated: mdwareType = (req, res, next) => {
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

export const isAdmin: mdwareType = (req, res, next) => {
    if (req.user && req.user.role == 'admin') return next();
    res.redirect('/login');
};

export const isManager: mdwareType = async (req, res, next) => {
    const user = await db.GroupPermissions.findOne({
        where: {
            userId: req.user.userId,
            groupId: req.body.groupId,
            permission: 'manager',
        },
    });

    if (!user) return res.redirect('/login');
    return next();
};

export const isMember: mdwareType = async (req, res, next) => {
    const user = await db.GroupPermissions.findOne({
        where: {
            userId: req.user.userId,
            groupId: req.body.groupId,
            permission: 'member',
        },
    });

    if (!user) return res.redirect('/login');
    return next();
};
