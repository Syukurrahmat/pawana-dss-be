import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApplicationModule } from './Api/App/app.module';
import { CompaniesModule } from './Api/Companies/companies.module';
import { NodesModule } from './Api/Nodes/nodes.module';
import { ReportsModule } from './Api/Reports/reports.module';
import { UsersModule } from './Api/Users/users.module';
import { AuthModule } from './Auth/auth.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserSessionMiddleware } from './middleware/userSession.middleware';
import allDBModels from './models';
import { DashboardModule } from './services/Dashboard/dashboard.module';
import { SummaryModule } from './services/Summary/summary.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
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
        RouterModule.register([{
            path: '/api',
            children: [
                ApplicationModule,
                ReportsModule,
                UsersModule,
                CompaniesModule,
                NodesModule,
            ].map(e => ({
                path: '/',
                module: e
            }))
        }]),
        AuthModule,
        ApplicationModule,
        ReportsModule,
        UsersModule,
        CompaniesModule,
        NodesModule,
        SummaryModule,
        DashboardModule,
    ],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, UserSessionMiddleware)
            .forRoutes('/api/*')
    }
}

