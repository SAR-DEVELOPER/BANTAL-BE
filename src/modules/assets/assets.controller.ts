import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from './core/entities/asset.entity';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { CreateAssetDto } from './core/dto/create-asset.dto';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }


    @Get('health-check')
    async healthCheck(): Promise<string> {
        return this.assetsService.healthCheck();
    }

    @Get('office')
    async getOffice(): Promise<Office[]> {
        return this.assetsService.getOffice();
    }

    @Get('roomsByOffice/:officeId')
    async getRoomsByOffice(@Param('officeId') officeId: string): Promise<Room[]> {
        return this.assetsService.getRoom(officeId);
    }

    @Get('assetsGroup')
    async getAssetsGroup(): Promise<AssetGroup[]> {
        return this.assetsService.getAssetGroup();
    }

    @Get('assetTypesByGroup/:groupId')
    async getAssetsTypeByGroup(@Param('groupId') groupId: string): Promise<AssetType[]> {
        return this.assetsService.getAssetTypeByGroup(groupId);
    }

    @Get('preview-code')
    async getPreviewAssetCode(
        @Query('companyId') companyId: string,
        @Query('groupId') groupId: string,
        @Query('typeId') typeId: string,
    ): Promise<{ previewCode: string }> {
        return this.assetsService.generatePreviewCode(companyId, groupId, typeId);
    }

    @Post('createAsset')
    async createAsset(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
        return this.assetsService.createAsset(createAssetDto);
    }
}