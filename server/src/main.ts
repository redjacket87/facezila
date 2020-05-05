import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';
import { MAXIMUM_FILE_SIZE } from './common/constants/constants';
import { HttpExceptionFilter } from './common/http/http-exeption-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.use(bodyParser.json({limit: `${MAXIMUM_FILE_SIZE}b`}));
  app.use(bodyParser.urlencoded({limit: `${MAXIMUM_FILE_SIZE}b`, extended: true}));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
