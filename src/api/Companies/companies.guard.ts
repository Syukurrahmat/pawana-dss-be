import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccessControl } from '../../types/accessControle';


@Injectable()
export class CompanyGuard implements CanActivate {

    private accessControl: AccessControl = {
        admin: ['GET', 'POST', 'PATCH', 'DELETE'],
        gov: ['GET'],
        manager: ['GET:OWN', 'POST', 'PATCH:OWN', 'DELETE:OWN'],
        regular: [],
    };

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request
        const user = request.user!

        console.log(request.path)

        const method = request.method
        const companyId = +request.params.id;

        const accessRules = this.accessControl[user.role];
        if (!accessRules) return false

        const alowedRule = accessRules.find(rule => rule.startsWith(method));
        if (!alowedRule) return false;

        const onlyOwn = alowedRule.split(':')[1]

        if (onlyOwn && companyId) {
            const isOwn = await user.getCompanies({ where: { companyId }, attributes: ['companyId'] }).then(e => e.length)

            return !!isOwn;
        }

        return false
    }
}
