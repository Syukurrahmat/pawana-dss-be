import { Abilities, AbilityBuilder, ConditionsMatcher, MatchConditions, PureAbility, createMongoAbility } from '@casl/ability';
import Users from "../models/users.js";
import { ControllerType } from "../types/index.js";
import db from '../models/index.js';


type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = 'all' | 'Users' | 'Companies' | 'Nodes' | 'Reports' | 'EventLogs' | 'DataLogs';

type Conditions = {
    isOwn: boolean,
    resourceId: number
}
type Ability = PureAbility<[Actions, Subjects], Partial<Conditions>>;

const methodToAction: { [key: string]: Actions } = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete'
};

function defineAbilitiesFor(user: Users) {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    can('manage', 'all')
    // switch (user.role) {
    //     case 'admin':
    //         can('manage', 'all');
    //         break;

    //     case 'gov':
    //         can('manage', 'all');
    //         break;

    //     case 'manager':
    //         can('read', 'Companies', { isOwn: true });
    //         can('read', 'Users', { resourceId: user.userId });
    //         break;

    //     case 'regular':
    //         can('manage', 'all');
    //         break;
    // }

    return build({
        detectSubjectType: (e: any) => e.__typename,
    });
}


export const accessControlSetResource = (resource: Subjects): ControllerType => {
    return (req, res, next) => {
        req.resource = resource
        return next();
    };
}

export const accessControl: ControllerType = async (req, res, next) => {
    const ability = defineAbilitiesFor(req.user!);
    const action = methodToAction[req.method];
    const resourceId = parseInt(req.params.id)
    const resource = req.resource as Subjects

    const isOwnFunc = req.user!['has' + resource]



    const subject = {
        resourceId: resourceId,
        isOwn: isOwnFunc ? await isOwnFunc([resourceId]) : false,
        __typename: resource
    };

    if (ability.cannot(action, subject as any)) return res.status(403).json({
        error: 'Anda tidak memiliki izin untuk melakukan tindakan ini'
    });


    if (resourceId) {
        const { primaryKeyAttribute } = db[resource]
        let g = await db[resource].count({ where: { [primaryKeyAttribute]: resourceId } })
    }

    return next();
};


