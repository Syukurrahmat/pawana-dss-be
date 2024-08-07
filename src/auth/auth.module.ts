import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy.js';
import SessionSerializer from './session.serializer.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../api/Users/users.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '../models/users.js';

@Module({
  controllers : [AuthController],
  imports: [PassportModule.register({ session: true }), SequelizeModule.forFeature([Users])],
  providers: [AuthService, LocalStrategy, SessionSerializer]
})

export class AuthModule { }
