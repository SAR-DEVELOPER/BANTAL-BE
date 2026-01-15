import { Injectable } from '@nestjs/common';
import { Asset } from './core/entities/asset.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { CreateAssetDto } from './core/dto/create-asset.dto';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Asset)
        private assetRepository: Repository<Asset>,
        @InjectRepository(Office)
        private officeRepository: Repository<Office>,
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(AssetGroup)
        private assetGroupRepository: Repository<AssetGroup>,
        @InjectRepository(AssetType)
        private assetTypeRepository: Repository<AssetType>,
        @InjectRepository(MasterCompanyList)
        private companyRepository: Repository<MasterCompanyList>,
    ) { }

    async healthCheck(): Promise<string> {
        return 'Assets service is running';
    }

    async getOffice(): Promise<Office[]> {
        return this.officeRepository.find();
    }

    async getRoom(officeId: string): Promise<Room[]> {
        return this.roomRepository.find({ where: { office: { id: officeId } } });
    }

    async getAssetGroup(): Promise<AssetGroup[]> {
        return this.assetGroupRepository.find();
    }

    async getAssetTypeByGroup(groupId: string): Promise<AssetType[]> {
        return this.assetTypeRepository.find({ where: { assetGroup: { id: groupId } } });
    }

    async generatePreviewCode(
        companyId: string,
        groupId: string,
        typeId: string,
    ): Promise<{ previewCode: string }> {
        // Fetch codes from entities
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        const group = await this.assetGroupRepository.findOne({ where: { id: groupId } });
        const type = await this.assetTypeRepository.findOne({ where: { id: typeId } });

        if (!company || !group || !type) {
            throw new Error('Invalid company, group, or type ID');
        }

        // Get current year (2-digit format)
        const currentYear = new Date().getFullYear().toString().slice(-2);

        // Count existing assets with same combination (including year)
        const count = await this.assetRepository.count({
            where: {
                company: { id: companyId },
                assetGroup: { id: groupId },
                assetType: { id: typeId },
            },
        });

        const nextIndex = (count + 1).toString().padStart(3, '0');
        const previewCode = `${company.companyCode}-${currentYear}-${group.groupCode}-${type.typeCode}-${nextIndex}`;

        return { previewCode };
    }

    async generateUniqueAssetCode(
        companyId: string,
        groupId: string,
        typeId: string,
    ): Promise<string> {
        // Re-fetch and re-count to handle race conditions
        const { previewCode } = await this.generatePreviewCode(companyId, groupId, typeId);
        return previewCode;
    }

    async createAsset(createAssetDto: CreateAssetDto): Promise<Asset> {
        const asset = this.assetRepository.create(createAssetDto);
        return this.assetRepository.save(asset);
    }
}