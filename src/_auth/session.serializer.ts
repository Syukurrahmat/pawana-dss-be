import { PassportSerializer } from "@nestjs/passport";

export default class SessionSerializer extends PassportSerializer {
    serializeUser(user: any, done: Function) {
        done(null, user)
    }
    deserializeUser(payload: any, done: Function) {
        console.log(payload)
        done(null, payload)
    }   
}
