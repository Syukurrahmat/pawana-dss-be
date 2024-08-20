import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const configureSwagger = (app : any) => {
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

}