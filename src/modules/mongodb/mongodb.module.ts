import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBConfig, defaultMongoDBConfig } from 'src/config/mongodb.config';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(defaultMongoDBConfig.uri, {
      dbName: defaultMongoDBConfig.database,
      ...defaultMongoDBConfig.options,
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDBModule {} 