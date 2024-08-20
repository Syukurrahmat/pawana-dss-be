import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from '../common/decorator/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get(Roles, context.getHandler());

        console.log(roles);
        if (roles == undefined) return true;

        const userRole = context.switchToHttp().getRequest().user.role;

        const rolesArr = Array.isArray(roles) ? roles : [roles];
        return rolesArr.includes(userRole);
    }
}
