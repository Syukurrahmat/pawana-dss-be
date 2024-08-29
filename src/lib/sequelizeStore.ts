import sequelizeStore from "connect-session-sequelize";
import session from 'express-session';
import { Sequelize } from "sequelize";

export const getSequelizeStore = async (sequelize: Sequelize) => {

    await sequelize.authenticate().then(() => {
        console.log('=========== DATABASE BERHASIL TERKONEKSI =========== ')
    })
    const SequelizeStore = sequelizeStore(session.Store);
    const store = new SequelizeStore({ db: sequelize })
    await sequelize.sync()

    return store
};
