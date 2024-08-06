import { ControllerType } from '../types/index.js';




export const isAuthenticated : ControllerType= (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};


export const userSessionData: ControllerType = async (req, res, next) => {
    const user = req.user!;
    const { role } = user;

    if (req.session.viewCompany === undefined && role == 'manager') {
        const company = await user.getCompanies({ attributes: ['companyId', 'coordinate', 'name', 'type',], limit: 1 });
        req.session.viewCompany = company[0] || null;
    }

    if (req.session.viewUser === undefined && (role == 'regular' || role == 'manager')) {
        const { userId, name, role } = user;
        req.session.viewUser = { userId, name, role };
    }


    if (req.session.tz === undefined) req.session.tz = 'Asia/Bangkok';
    next();
};
