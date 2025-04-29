import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from '../mongodb/schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Document', schema: DocumentSchema }
    ]),
  ],
  controllers: [DevController],
  providers: [DevService],
  exports: [DevService],
})
export class DevModule {} 