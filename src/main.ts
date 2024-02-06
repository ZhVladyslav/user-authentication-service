import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import * as process from 'process';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('bootstrap');

    if (!process.env.JWT_SECRET) {
        logger.error('there is no jwt secret key in env file');
        process.exit(1);
    }

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(+process.env.PORT || 3000);
}

bootstrap();
