import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AccessControl } from '../../types/accessControle';


@Injectable()
export class UserGuard implements CanActivate {
    private accessControl: AccessControl = {
        admin: ['GET', 'POST', 'PATCH', 'DELETE'],
        gov: ['GET', 'PATCH:OWN', 'DELETE:OWN'],
        manager: ['GET:OWN', 'PATCH:OWN', 'DELETE:OWN'],
        regular: ['GET:OWN', 'PATCH:OWN',  'DELETE:OWN'],
    };

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request
        const user = request.user!

        const method = request.method
        const userId = +request.params.id;

        const accessRules = this.accessControl[user.role];

        if (!accessRules) return false

        for (const rule of accessRules) {
            const [allowedMethod, onlyOwn] = rule.split(':')

            if (allowedMethod === method) {

                if (onlyOwn) return userId !== undefined && userId === user.userId

                return true;
            }
        }


        return false
    }
}
