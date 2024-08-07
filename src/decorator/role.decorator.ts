import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types';

export const Roles = Reflector.createDecorator<UserRole | UserRole[] | undefined>();