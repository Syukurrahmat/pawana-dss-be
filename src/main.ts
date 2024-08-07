import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/transformInterceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import Users from './models/users';
import { Request } from 'express';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Cats example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('Users')
        .addTag('Users subscription')
        .addTag('Companies')
        .addTag('Companies subscription')
        .addTag('Eventlogs')
        .addTag('Reports')
        .addTag('Nodes')
        .addTag('Nodes subscriber')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        jsonDocumentUrl: 'swagger/json',
    });

    app.use(
        session({
            secret: 'my-secret',
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 3600000 }
        }),
    );

    app.use(passport.initialize())
    app.use(passport.session())

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.useGlobalInterceptors(new ResponseInterceptor())

    
    app.use(async (req:Request, res, next) => {
        req.user = await Users.findByPk(6) || undefined
        next()
    })

    await app.listen(3000);
}

bootstrap();