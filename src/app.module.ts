import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { PUBLIC_DIR } from './config/config';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { SequelizeModule } from '@nestjs/sequelize';
import allDBModels from './models';
import { NodeSubscriptionModule } from './users/nodeSubscription/nodeSubscription.module';

@Module({
    imports: [
        // AuthModule,
        UsersModule,
        EmailModule,
        NodeSubscriptionModule,
        ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', PUBLIC_DIR) }),
        ConfigModule.forRoot({ isGlobal: true }),
        SequelizeModule.forRoot({
            dialect: 'mysql',
            host: process.env.DB_HOSTNAME!,
            port: parseInt(process.env.DB_PORT!),
            username: process.env.DB_USERNAME!,
            password: process.env.DB_PASSWORD!,
            database: process.env.DB_DATABASE!,
            models: allDBModels,
        }),
    ],

    controllers: [AppController],
    providers: [],
})

export class AppModule { }
