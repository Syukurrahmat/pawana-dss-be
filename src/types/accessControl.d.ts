import { UserRole } from '.';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type AccessRule = `${Method}:OWN` | Method;

type AccessControl = {
    [role in UserRole]: AccessRule[];
};
