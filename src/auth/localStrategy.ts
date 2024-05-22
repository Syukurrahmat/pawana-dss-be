import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        (email: string, password: string, done) => {
            db.Users.findOne({ where: { email } })
                .then((user) => {
                    if (!user || !bcrypt.compareSync(password, user.password)) {
                        return done(null, false);
                    }

                    console.log('okekk')
                    return done(null, user.toJSON());
                })
                .catch((err) => done(null, false));
        }
    )
);

passport.serializeUser((user: any, done) => done(null, user.userId));

passport.deserializeUser((id: number, done) => {
    db.Users.findByPk(id)
        .then((user) => done(null, user))
        .catch((err) => done(err));
});
