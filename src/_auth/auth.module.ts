import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy.js';
import SessionSerializer from './session.serializer.js';
import { AuthController } from './auth.controller.js';

@Module({
  controllers : [AuthController],
  imports: [UsersModule, PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer]
})

export class AuthModule { }
