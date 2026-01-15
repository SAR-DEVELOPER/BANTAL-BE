import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './core/entities/asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Office, Room, AssetGroup, AssetType, MasterCompanyList])],
  providers: [AssetsService],
  controllers: [AssetsController],
})
export class AssetsModule {}