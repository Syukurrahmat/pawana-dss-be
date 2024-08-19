import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '../models/users.js';
import { EmailService } from '../services/Email.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LocalStrategy } from './local.strategy.js';
import SessionSerializer from './session.serializer.js';

@Module({
  controllers: [AuthController],
  imports: [PassportModule.register({ session: true }), SequelizeModule.forFeature([Users])],
  providers: [AuthService, LocalStrategy, SessionSerializer, EmailService]
})

export class AuthModule { }
