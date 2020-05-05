import { Module } from '@nestjs/common';
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from '@nestjs/mongoose';

import { HttpExceptionFilter } from './common/http/http-exeption-filter';
import { UniqalizationModule } from './uniqualization/uniqalization.module';

@Module({
  imports: [
      MongooseModule.forRoot('mongodb://localhost:27017/uniqalization', {
          connectionName: 'uniqalization',
      }),
      UniqalizationModule
  ],
  controllers: [],
  providers: [
      {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
      }
  ],
})
export class AppModule {}
