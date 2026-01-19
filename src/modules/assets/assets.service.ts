import { Injectable, Logger } from '@nestjs/common';
import { Asset } from './core/entities/asset.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { CreateAssetDto } from './core/dto/create-asset.dto';
import { MinioService } from '@modules/minio';

@Injectable()
export class AssetsService {
    private readonly logger = new Logger(AssetsService.name);

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
        private readonly minioService: MinioService,
    ) { }

    async healthCheck(): Promise<string> {
        return 'Assets service is running';
    }

    /**
     * Health check for MinIO connection and upload capability
     * Tests:
     * 1. MinIO connection
     * 2. Bucket accessibility
     * 3. Upload capability (creates a test file)
     * 4. File existence check
     * 5. File deletion (cleanup) - optional based on keepTestFile parameter
     * 
     * @param keepTestFile - If true, the test file will not be deleted (default: false)
     */
    async minioHealthCheck(keepTestFile: boolean = false): Promise<{
        status: 'healthy' | 'unhealthy';
        message: string;
        details: {
            connection: boolean;
            bucketAccess: boolean;
            uploadCapability: boolean;
            fileOperations: boolean;
        };
        timestamp: Date;
        testResults?: {
            uploadedFile?: string;
            fileUrl?: string;
            fileSize?: number;
            uploadTime?: number;
        };
        error?: string;
    }> {
        const startTime = Date.now();
        const testBucket = 'bantal-assets';
        const testPath = 'health-check/';
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = Buffer.from('MinIO health check test file - ' + new Date().toISOString());

        const details = {
            connection: false,
            bucketAccess: false,
            uploadCapability: false,
            fileOperations: false,
        };

        try {
            this.logger.debug('Starting MinIO health check...');

            // Test 1: Check connection by listing files (this will fail if connection is bad)
            try {
                await this.minioService.listFiles(testBucket, testPath, false);
                details.connection = true;
                details.bucketAccess = true;
                this.logger.debug('✓ MinIO connection and bucket access OK');
            } catch (error) {
                this.logger.error('✗ MinIO connection or bucket access failed', error.message);
                throw new Error(`Connection/Bucket access failed: ${error.message}`);
            }

            // Test 2: Upload capability
            let uploadResult;
            try {
                uploadResult = await this.minioService.uploadFile(
                    testBucket,
                    testPath,
                    testFileName,
                    testContent,
                    {
                        contentType: 'text/plain',
                        metadata: {
                            'test': 'health-check',
                            'timestamp': new Date().toISOString(),
                        }
                    }
                );
                details.uploadCapability = true;
                this.logger.debug(`✓ Upload capability OK - File: ${uploadResult.objectPath}`);
            } catch (error) {
                this.logger.error('✗ Upload capability failed', error.message);
                throw new Error(`Upload failed: ${error.message}`);
            }

            // Test 3: File operations (check existence and optionally delete)
            try {
                // Check if file exists
                const exists = await this.minioService.fileExists(testBucket, uploadResult.objectPath);
                if (!exists) {
                    throw new Error('Uploaded file not found');
                }

                // Get file metadata
                const metadata = await this.minioService.getFileMetadata(testBucket, uploadResult.objectPath);
                this.logger.debug(`✓ File exists with size: ${metadata.size} bytes`);

                // Conditionally clean up - delete test file
                if (!keepTestFile) {
                    await this.minioService.deleteFile(testBucket, uploadResult.objectPath);
                    this.logger.debug('✓ File deleted successfully');
                } else {
                    this.logger.debug('✓ File kept for manual inspection');
                }

                details.fileOperations = true;
            } catch (error) {
                this.logger.error('✗ File operations failed', error.message);
                // Try to clean up anyway (only if keepTestFile is false)
                if (!keepTestFile) {
                    try {
                        await this.minioService.deleteFile(testBucket, uploadResult.objectPath);
                    } catch (cleanupError) {
                        this.logger.warn('Failed to clean up test file', cleanupError.message);
                    }
                }
                throw new Error(`File operations failed: ${error.message}`);
            }

            const uploadTime = Date.now() - startTime;

            // All tests passed
            return {
                status: 'healthy',
                message: keepTestFile 
                    ? 'MinIO is fully operational (test file kept for inspection)'
                    : 'MinIO is fully operational',
                details,
                timestamp: new Date(),
                testResults: {
                    uploadedFile: uploadResult.objectPath,
                    fileUrl: uploadResult.url,
                    fileSize: uploadResult.fileSize,
                    uploadTime,
                },
            };

        } catch (error) {
            this.logger.error('MinIO health check failed', error.stack);
            return {
                status: 'unhealthy',
                message: 'MinIO health check failed',
                details,
                timestamp: new Date(),
                error: error.message,
            };
        }
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