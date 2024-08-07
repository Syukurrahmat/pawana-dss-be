import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CompaniesModule } from './api/Companies/companies.module';
import { CompanyNodeSubsModule } from './api/Companies/CompanyNodeSubs/companyNodeSubs.module';
import { NodesModule } from './api/Nodes/nodes.module';
import { NodeSubscriberModule } from './api/Nodes/NodeSubscriber/nodeSubscriber.module';
import { ReportsModule } from './api/Reports/reports.module';
import { UserNodeSubsModule } from './api/Users/UserNodeSubs/userNodeSubs.module';
import { UsersModule } from './api/Users/users.module';
import { AuthModule } from './auth/auth.module';
import { PUBLIC_DIR } from './config/config';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserSessionMiddleware } from './middleware/userSession.middleware';
import allDBModels from './models';
import { EventlogsModule } from './api/Companies/Eventlogs/eventlog.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        UserNodeSubsModule,
        ReportsModule,
        CompaniesModule,
        CompanyNodeSubsModule,
        NodesModule,
        NodeSubscriberModule,
        EventlogsModule,
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
        RouterModule.register([
            {
                path: '/api',
                children:
                    [
                        UsersModule,
                        UserNodeSubsModule,
                        ReportsModule,
                        CompaniesModule,
                        CompanyNodeSubsModule,
                        NodesModule,
                        NodeSubscriberModule,
                        EventlogsModule
                    ].map(e => ({
                        path: '/',
                        module: e
                    }))
            }])
    ],

    providers: [],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, UserSessionMiddleware)
            .forRoutes('/api/*')
    }
}

