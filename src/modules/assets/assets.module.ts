import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './core/entities/asset.entity';
import { AssetHistory } from './core/entities/asset-history.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { Identity } from '../identity/core/entities/identity.entity';
import { AuthModule } from '../auth/auth.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asset, AssetHistory, Office, Room, AssetGroup, AssetType, MasterCompanyList, Identity]),
        AuthModule,
        IdentityModule,
    ],
    providers: [AssetsService],
    controllers: [AssetsController],
})
export class AssetsModule { }