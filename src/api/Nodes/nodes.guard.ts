import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import Nodes from '../../models/nodes';
import { AccessControl } from '../../types/accessControle';


@Injectable()
export class NodesGuard implements CanActivate {

    private accessControl: AccessControl = {
        admin: ['GET', 'POST', 'PATCH', 'DELETE'],
        gov: ['GET'],
        manager: ['GET:OWN', 'POST', 'PATCH:OWN', 'DELETE:OWN'],
        regular: ['GET:OWN'],
    };

    private alowedPath = 1

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request
        const user = request.user!
        console.log('sjsjskssbjsbsjbsjbsjbsjbsjbbbbbbbbbbbbbbbbbbbbbbbbbb')
        console.log(request.path)

        const method = request.method
        const nodeId = +request.params.id;

        const accessRules = this.accessControl[user.role];
        if (!accessRules) return false

        const alowedRule = accessRules.find(rule => rule.startsWith(method));
        if (!alowedRule) return false;

        const onlyOwn = alowedRule.split(':')[1]
        if (!onlyOwn) return true

        if (onlyOwn && nodeId) {

            if (user.role == 'regular') {
                return !! await user.getSubscribedNodes({ where: { nodeId }, attributes: ['nodeId'] }).then(e => e.length)
            }

            if (user.role == 'manager') {
                const isSubscibedNode = await user.getSubscribedNodes({ where: { nodeId }, attributes: ['nodeId'] }).then(e => e.length)
                if (isSubscibedNode) return true

                const companyIds = await user.getCompanies({ attributes: ['companyId'] }).then(e => e.map(f => f.companyId!))
                return !! await Nodes.count({ where: { companyId: { [Op.in]: companyIds } } })
            }
            return false;
        }

        return false
    }
}
