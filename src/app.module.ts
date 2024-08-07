import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CompaniesModule } from './api/Companies/companies.module';
import { CompanyNodeSubsModule } from './api/Companies/CompanyNodeSubs/companyNodeSubs.module';
import { EventlogsModule } from './api/Companies/Eventlogs/eventlog.module';
import { NodesModule } from './api/Nodes/nodes.module';
import { NodeSubscriberModule } from './api/Nodes/NodeSubscriber/nodeSubscriber.module';
import { ReportsModule } from './api/Reports/reports.module';
import { UserNodeSubsModule } from './api/Users/UserNodeSubs/userNodeSubs.module';
import { UsersModule } from './api/Users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserSessionMiddleware } from './middleware/userSession.middleware';
import allDBModels from './models';
import { DashboardModule } from './services/Dashboard/dashboard.module';
import { SummaryModule } from './services/Summary/summary.module';
import { ApplicationModule } from './api/App/app.module';

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
                UsersModule,
                UserNodeSubsModule,
                ReportsModule,
                CompaniesModule,
                CompanyNodeSubsModule,
                NodesModule,
                NodeSubscriberModule,
                EventlogsModule,
                ApplicationModule,
            ].map(e => ({
                path: '/',
                module: e
            }))
        }]),
        SummaryModule,
        AuthModule,
        UsersModule,
        UserNodeSubsModule,
        ReportsModule,
        CompaniesModule,
        CompanyNodeSubsModule,
        NodesModule,
        NodeSubscriberModule,
        EventlogsModule,
        DashboardModule,
        ApplicationModule,
    ],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, UserSessionMiddleware)
            .forRoutes('/api/*')
    }
}

