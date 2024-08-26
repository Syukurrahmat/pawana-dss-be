import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import Nodes from '../../models/nodes';
import { AccessControl } from '../../types/accessControl';

@Injectable()
export class NodesGuard implements CanActivate {
    private accessControl: AccessControl = {
        admin: ['GET', 'POST', 'PATCH', 'DELETE'],
        gov: ['GET'],
        manager: ['GET:OWN', 'POST', 'PATCH:OWN', 'DELETE:OWN'],
        regular: ['GET:OWN'],
    };

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request;
        const user = request.user!;

        const method = request.method;
        const nodeId = +request.params.id;

        const accessRules = this.accessControl[user.role];
        if (!accessRules) return false;

        const alowedRule = accessRules.find((rule) => rule.startsWith(method));
        if (!alowedRule) return false;

        const onlyOwn = alowedRule.split(':')[1];
        if (!onlyOwn) return true;

        if (onlyOwn && nodeId) {
            if (method == 'GET') {

                if (user.role == 'regular') {
                    if (await user.hasSubscribedNode(nodeId)) return true;
                }

                if (user.role == 'manager') {
                    const companies = await user.getCompanies({ attributes: ['companyId'] });

                    for (let company of companies) {
                        if (await company.hasPrivateNode(nodeId)) return true;
                    }
                    for (let company of companies) {
                        if (await company.hasSubscribedNode(nodeId)) return true;
                    }
                }
                return false;
            } else {
                const companies = await user.getCompanies({ attributes: ['companyId'] });

                for (let company of companies) {
                    if (await company.hasPrivateNode(nodeId)) return true;
                }
            }
        }

        return false;
    }
}
