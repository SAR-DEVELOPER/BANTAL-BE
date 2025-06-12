import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterClientList } from 'src/entities/master-client-list.entity';
import { ClientType } from 'src/entities/client-type.entity';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterClientList,
      ClientType
    ]),
  ],
  providers: [
    ClientService,
  ],
  controllers: [
    ClientController,
  ],
  exports: [
    ClientService,
  ],
})
export class ClientModule {} 