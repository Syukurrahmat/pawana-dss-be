import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationModule } from './Api/App/app.module';
import { CompaniesModule } from './Api/Companies/companies.module';
import { NodesModule } from './Api/Nodes/nodes.module';
import { ReportsModule } from './Api/Reports/reports.module';
import { UsersModule } from './Api/Users/users.module';
import { AuthModule } from './Auth/auth.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { UserSessionMiddleware } from './common/middleware/userSession.middleware';
import allDBModels from './models';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
    imports: [
        ApplicationModule,
        ReportsModule,
        UsersModule,
        CompaniesModule,
        NodesModule,
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
        }),
        SequelizeModule.forRoot({
            dialect: 'mysql',
            host: process.env.DB_HOSTNAME!,
            port: parseInt(process.env.DB_PORT!),
            username: process.env.DB_USERNAME!,
            password: process.env.DB_PASSWORD!,
            database: process.env.DB_DATABASE!,
            models: allDBModels,
            logging: false,
        }),
        RouterModule.register([
            {
                path: '/api',
                children: [ApplicationModule, ReportsModule, UsersModule, CompaniesModule, NodesModule]
                    .map((e) => ({ path: '/', module: e })),
            },
            {
                path: '/auth',
                children: [AuthModule]
                    .map((e) => ({ path: '/', module: e })),
            },
        ]),
    ],
    controllers: [AppController],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*')
            .apply(AuthMiddleware, UserSessionMiddleware)
            .exclude('/login', '/verify', '/auth/(.*)')
            .forRoutes('*')

    }
}


