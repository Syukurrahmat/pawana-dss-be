import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export default class LocalAuthenticationGuard extends AuthGuard('local') {
    constructor() {
        super()
    }
    async canActivate(context: ExecutionContext) {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest() as Request

        try {
            await super.logIn(request);
        } catch (error) {
            console.error('Error during logIn:', error);
            throw error;
        }
        return result;
    }

}