import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UniqalizationSchema } from './models/uniqalization.model';
import { UniqalizationService } from './uniqalization.service';
import { UniqalizationController } from './uniqualization.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Uniqalization', schema: UniqalizationSchema }], 'uniqalization')],
    controllers: [UniqalizationController],
    providers: [UniqalizationService],
})
export class UniqalizationModule {}
