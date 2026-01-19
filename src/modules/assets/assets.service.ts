import { Injectable, Logger, NotFoundException, UnauthorizedException, StreamableFile } from '@nestjs/common';
import { Asset } from './core/entities/asset.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { CreateAssetDto } from './core/dto/create-asset.dto';
import { QueryAssetsDto } from './core/dto/query-assets.dto';
import { PublicAssetDto } from './core/dto/public-asset.dto';
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

    /**
     * Create a new asset with file uploads
     * Handles uploading files to MinIO and saving asset data to database
     * 
     * @param createAssetDto - Asset data from form
     * @param files - Optional files (assetImage, invoiceFile, taxInvoiceFile)
     * @returns Created asset with all relations loaded
     */
    async createAssetWithFiles(
        createAssetDto: CreateAssetDto,
        files?: {
            assetImage?: Express.Multer.File[];
            invoiceFile?: Express.Multer.File[];
            taxInvoiceFile?: Express.Multer.File[];
        },
    ): Promise<Asset> {
        this.logger.debug('Creating asset with files...');
        this.logger.debug(`DTO: ${JSON.stringify(createAssetDto)}`);
        this.logger.debug(`Files: ${JSON.stringify(files ? Object.keys(files) : 'none')}`);

        const bucket = 'bantal-assets';
        const currentYear = new Date().getFullYear().toString();

        // Generate unique asset code first (we need it for file paths)
        const assetCode = await this.generateUniqueAssetCode(
            createAssetDto.companyId,
            createAssetDto.assetGroupId,
            createAssetDto.assetTypeId,
        );

        this.logger.debug(`Generated asset code: ${assetCode}`);

        // Upload files to MinIO if provided
        let photoUrl: string | null = null;
        let invoiceFileUrl: string | null = null;
        let taxInvoiceFileUrl: string | null = null;

        try {
            // Upload asset image (PRIVATE - requires presigned URL to access)
            if (files?.assetImage?.[0]) {
                const assetImageFile = files.assetImage[0];
                this.logger.debug(`Uploading asset image: ${assetImageFile.originalname}`);
                const result = await this.minioService.uploadMulterFile(
                    bucket,
                    `images/${currentYear}/${assetCode}/`,
                    assetImageFile,
                    {
                        metadata: {
                            'asset-code': assetCode,
                            'upload-type': 'asset-image',
                            'uploaded-at': new Date().toISOString(),
                        },
                        isPublic: false, // CHANGED: Now private for security
                    },
                );
                // Store object path, not full URL
                photoUrl = result.objectPath;
                this.logger.debug(`Asset image uploaded: ${photoUrl}`);
            }

            // Upload invoice file (PRIVATE)
            if (files?.invoiceFile?.[0]) {
                const invoiceFile = files.invoiceFile[0];
                this.logger.debug(`Uploading invoice file: ${invoiceFile.originalname}`);
                const result = await this.minioService.uploadMulterFile(
                    bucket,
                    `documents/invoices/${currentYear}/${assetCode}/`,
                    invoiceFile,
                    {
                        metadata: {
                            'asset-code': assetCode,
                            'upload-type': 'invoice',
                            'uploaded-at': new Date().toISOString(),
                        },
                        isPublic: false, // CHANGED: Now private for security
                    },
                );
                // Store object path, not full URL
                invoiceFileUrl = result.objectPath;
                this.logger.debug(`Invoice file uploaded: ${invoiceFileUrl}`);
            }

            // Upload tax invoice file (PRIVATE)
            if (files?.taxInvoiceFile?.[0]) {
                const taxInvoiceFile = files.taxInvoiceFile[0];
                this.logger.debug(`Uploading tax invoice file: ${taxInvoiceFile.originalname}`);
                const result = await this.minioService.uploadMulterFile(
                    bucket,
                    `documents/tax-invoices/${currentYear}/${assetCode}/`,
                    taxInvoiceFile,
                    {
                        metadata: {
                            'asset-code': assetCode,
                            'upload-type': 'tax-invoice',
                            'uploaded-at': new Date().toISOString(),
                        },
                        isPublic: false, // CHANGED: Now private for security
                    },
                );
                // Store object path, not full URL
                taxInvoiceFileUrl = result.objectPath;
                this.logger.debug(`Tax invoice file uploaded: ${taxInvoiceFileUrl}`);
            }
        } catch (error) {
            this.logger.error('Failed to upload files to MinIO', error.stack);
            throw new Error(`File upload failed: ${error.message}`);
        }

        // Prepare asset data for database
        const assetData: any = {
            name: createAssetDto.name,
            assetCode: assetCode, // Use generated code
            description: createAssetDto.description,
            photoUrl: photoUrl,
            currentCondition: createAssetDto.currentCondition,
            isActive: createAssetDto.isActive ?? true,
            createdBy: createAssetDto.createdById,
            updatedBy: createAssetDto.updatedById,
        };

        // Add financial data if provided
        if (createAssetDto.acquisitionDate) {
            assetData.acquisitionDate = new Date(createAssetDto.acquisitionDate);
        }
        if (createAssetDto.acquisitionPrice !== undefined) {
            assetData.acquisitionPrice = createAssetDto.acquisitionPrice;
        }
        if (createAssetDto.vat !== undefined) {
            assetData.vat = createAssetDto.vat;
        }
        if (createAssetDto.taxInvoiceNumber) {
            assetData.taxInvoiceNumber = createAssetDto.taxInvoiceNumber;
        }
        if (taxInvoiceFileUrl) {
            assetData.taxInvoiceFile = taxInvoiceFileUrl;
        }
        assetData.invoiceNumber = createAssetDto.invoiceNumber;
        if (invoiceFileUrl) {
            assetData.invoiceFile = invoiceFileUrl;
        }

        // Add relations
        assetData.company = { id: createAssetDto.companyId };
        assetData.assetGroup = { id: createAssetDto.assetGroupId };
        assetData.assetType = { id: createAssetDto.assetTypeId };
        assetData.office = { id: createAssetDto.officeId };

        if (createAssetDto.roomId) {
            assetData.room = { id: createAssetDto.roomId };
        }
        if (createAssetDto.employeeId) {
            assetData.employee = { id: createAssetDto.employeeId };
        }

        // Create and save asset
        try {
            const asset = this.assetRepository.create(assetData);
            await this.assetRepository.save(asset);

            this.logger.debug(`Asset created successfully with code: ${assetCode}`);

            // Load the saved asset with relations
            const assetWithRelations = await this.assetRepository.findOne({
                where: { assetCode: assetCode },
                relations: ['company', 'assetGroup', 'assetType', 'office', 'room', 'employee'],
            });

            if (!assetWithRelations) {
                throw new Error('Failed to retrieve created asset');
            }

            return assetWithRelations;
        } catch (error) {
            this.logger.error('Failed to save asset to database', error.stack);
            throw new Error(`Failed to create asset: ${error.message}`);
        }
    }

    /**
     * Find all assets with filtering, pagination, and sorting
     * 
     * @param queryDto - Query parameters for filtering and pagination
     * @returns Paginated list of assets with metadata
     */
    async findAll(queryDto: QueryAssetsDto): Promise<{
        data: Asset[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        this.logger.debug(`Finding assets with filters: ${JSON.stringify(queryDto)}`);

        const {
            companyId,
            assetGroupId,
            assetTypeId,
            officeId,
            roomId,
            employeeId,
            isActive,
            search,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = queryDto;

        // Create query builder with relations
        const queryBuilder = this.assetRepository
            .createQueryBuilder('asset')
            .leftJoinAndSelect('asset.company', 'company')
            .leftJoinAndSelect('asset.assetGroup', 'assetGroup')
            .leftJoinAndSelect('asset.assetType', 'assetType')
            .leftJoinAndSelect('asset.office', 'office')
            .leftJoinAndSelect('asset.room', 'room')
            .leftJoinAndSelect('asset.employee', 'employee');

        // Apply filters
        if (companyId) {
            queryBuilder.andWhere('asset.company_id = :companyId', { companyId });
        }

        if (assetGroupId) {
            queryBuilder.andWhere('asset.asset_group_id = :assetGroupId', { assetGroupId });
        }

        if (assetTypeId) {
            queryBuilder.andWhere('asset.asset_type_id = :assetTypeId', { assetTypeId });
        }

        if (officeId) {
            queryBuilder.andWhere('asset.office_id = :officeId', { officeId });
        }

        if (roomId) {
            queryBuilder.andWhere('asset.room_id = :roomId', { roomId });
        }

        if (employeeId) {
            queryBuilder.andWhere('asset.employee_id = :employeeId', { employeeId });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('asset.is_active = :isActive', { isActive });
        }

        if (search) {
            queryBuilder.andWhere(
                '(asset.name ILIKE :search OR asset.asset_code ILIKE :search OR asset.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Get total count before pagination
        const total = await queryBuilder.getCount();

        // Apply pagination and sorting
        const data = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy(`asset.${sortBy}`, sortOrder)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        this.logger.debug(`Found ${data.length} assets out of ${total} total`);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    /**
     * Find a single asset by ID with all relations
     * 
     * @param id - Asset UUID
     * @returns Asset with all relations
     * @throws NotFoundException if asset not found
     */
    async findById(id: string): Promise<Asset> {
        this.logger.debug(`Finding asset by ID: ${id}`);

        const asset = await this.assetRepository.findOne({
            where: { id },
            relations: ['company', 'assetGroup', 'assetType', 'office', 'room', 'employee'],
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID "${id}" not found`);
        }

        return asset;
    }

    /**
     * Generate presigned URLs for asset files
     * Provides secure, time-limited access to private files
     * 
     * @param assetId - Asset UUID
     * @param userId - User ID for authorization check
     * @returns Object with presigned URLs for all files
     * @throws NotFoundException if asset not found
     * @throws UnauthorizedException if user doesn't have permission
     */
    async getAssetFileUrls(
        assetId: string,
        userId: string,
    ): Promise<{
        photoUrl: string | null;
        invoiceFileUrl: string | null;
        taxInvoiceFileUrl: string | null;
        expiresAt: Date;
    }> {
        this.logger.debug(`Generating presigned URLs for asset ${assetId} by user ${userId}`);

        // Find asset
        const asset = await this.findById(assetId);

        // TODO: Add authorization check based on your business logic
        // Example: Check if user belongs to same company, has proper role, etc.
        // For now, we'll allow all authenticated users
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        const expirySeconds = 3600; // 1 hour
        const expiresAt = new Date(Date.now() + expirySeconds * 1000);
        const bucket = 'bantal-assets';

        // Generate presigned URLs for available files
        let photoUrl: string | null = null;
        let invoiceFileUrl: string | null = null;
        let taxInvoiceFileUrl: string | null = null;

        try {
            if (asset.photoUrl) {
                photoUrl = await this.minioService.getPresignedUrl(bucket, asset.photoUrl, expirySeconds);
                this.logger.debug(`Generated presigned URL for photo: ${asset.photoUrl}`);
            }

            if (asset.invoiceFile) {
                invoiceFileUrl = await this.minioService.getPresignedUrl(bucket, asset.invoiceFile, expirySeconds);
                this.logger.debug(`Generated presigned URL for invoice: ${asset.invoiceFile}`);
            }

            if (asset.taxInvoiceFile) {
                taxInvoiceFileUrl = await this.minioService.getPresignedUrl(bucket, asset.taxInvoiceFile, expirySeconds);
                this.logger.debug(`Generated presigned URL for tax invoice: ${asset.taxInvoiceFile}`);
            }
        } catch (error) {
            this.logger.error(`Failed to generate presigned URLs: ${error.message}`, error.stack);
            throw new Error(`Failed to generate file URLs: ${error.message}`);
        }

        return {
            photoUrl,
            invoiceFileUrl,
            taxInvoiceFileUrl,
            expiresAt,
        };
    }

    /**
     * Get public asset information (no authentication required)
     * Returns only basic information: status, location, and image availability
     * 
     * @param assetId - Asset UUID
     * @returns Public asset DTO with basic info
     * @throws NotFoundException if asset not found
     */
    async getPublicAsset(assetId: string): Promise<PublicAssetDto> {
        this.logger.debug(`Fetching public asset: ${assetId}`);

        // Find asset with all necessary relations
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
            relations: ['company', 'assetGroup', 'assetType', 'office', 'room'],
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID "${assetId}" not found`);
        }

        return {
            id: asset.id,
            assetCode: asset.assetCode,
            name: asset.name,
            description: asset.description || null,
            isActive: asset.isActive,
            currentCondition: asset.currentCondition,
            assetGroup: asset.assetGroup ? {
                id: asset.assetGroup.id,
                name: asset.assetGroup.groupName,
                groupCode: asset.assetGroup.groupCode,
            } : null,
            assetType: asset.assetType ? {
                id: asset.assetType.id,
                name: asset.assetType.name,
                typeCode: asset.assetType.typeCode,
            } : null,
            company: asset.company ? {
                id: asset.company.id,
                name: asset.company.companyName,
                companyCode: asset.company.companyCode,
            } : null,
            office: asset.office ? {
                id: asset.office.id,
                name: asset.office.name,
                address: asset.office.address || undefined,
                officeCode: asset.office.officeCode,
            } : null,
            room: asset.room ? {
                id: asset.room.id,
                name: asset.room.name,
                roomCode: asset.room.roomCode,
            } : null,
            hasPhoto: !!asset.photoUrl,
        };
    }

    /**
     * Stream public asset image (no authentication required)
     * 
     * @param assetId - Asset UUID
     * @param res - Express response object
     * @returns Streamable file
     * @throws NotFoundException if asset or image not found
     */
    async streamPublicAssetImage(assetId: string, res: any): Promise<StreamableFile> {
        this.logger.debug(`Streaming public asset image: ${assetId}`);

        // Find asset
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
            select: ['id', 'name', 'photoUrl'],
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID "${assetId}" not found`);
        }

        if (!asset.photoUrl) {
            throw new NotFoundException(`Asset "${assetId}" does not have a photo`);
        }

        const bucket = 'bantal-assets';
        
        try {
            // Get stream from MinIO
            const { stream, contentType, contentLength } = await this.minioService.getObjectStream(
                bucket,
                asset.photoUrl,
            );

            // Set response headers
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${asset.name}_photo"`,
                ...(contentLength && { 'Content-Length': contentLength }),
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            });

            return new StreamableFile(stream);
        } catch (error) {
            this.logger.error(`Failed to stream asset image: ${error.message}`, error.stack);
            throw new NotFoundException(`Failed to stream image: ${error.message}`);
        }
    }
}