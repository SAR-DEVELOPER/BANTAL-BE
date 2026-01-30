import { Controller, Get, Param, Post, Patch, Query, Body, UseInterceptors, UploadedFiles, Request, UnauthorizedException, NotFoundException, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { EnhancedJwtAuthGuard } from '../auth/guards/enhanced-jwt-auth.guard';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { Asset } from './core/entities/asset.entity';
import { AssetHistory } from './core/entities/asset-history.entity';
import { Office } from './core/entities/office.entity';
import { Room } from './core/entities/room.entity';
import { AssetGroup } from './core/entities/asset-group.entity';
import { AssetType } from './core/entities/asset-type.entity';
import { CreateAssetDto } from './core/dto/create-asset.dto';
import { QueryAssetsDto } from './core/dto/query-assets.dto';
import { PublicAssetDto } from './core/dto/public-asset.dto';
import { CreateAssetHistoryDto } from './core/dto/create-asset-history.dto';
import { QueryAssetHistoryDto } from './core/dto/query-asset-history.dto';
import { UpdateOfficeFloorplanDto } from './core/dto/update-office-floorplan.dto';
import { UpdateRoomFloorplanDto } from './core/dto/update-room-floorplan.dto';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }


    // ========================================
    // STATIC ROUTES (must come before dynamic :id routes)
    // ========================================

    @Get()
    async findAll(@Query() queryDto: QueryAssetsDto): Promise<{
        data: Asset[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        return this.assetsService.findAll(queryDto);
    }

    @Get('health-check')
    async healthCheck(): Promise<string> {
        return this.assetsService.healthCheck();
    }

    @Get('health-check/minio')
    async minioHealthCheck(
        @Query('keepTestFile') keepTestFile?: string,
    ): Promise<{
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
        console.log('Minio health check requested');
        const shouldKeepFile = keepTestFile === 'true' || keepTestFile === '1';
        return this.assetsService.minioHealthCheck(shouldKeepFile);
    }

    @Get('office')
    async getOffice(): Promise<Office[]> {
        return this.assetsService.getOffice();
    }

    @Get('assetsGroup')
    async getAssetsGroup(): Promise<AssetGroup[]> {
        return this.assetsService.getAssetGroup();
    }

    @Get('preview-code')
    async getPreviewAssetCode(
        @Query('companyId') companyId: string,
        @Query('groupId') groupId: string,
        @Query('typeId') typeId: string,
    ): Promise<{ previewCode: string }> {
        return this.assetsService.generatePreviewCode(companyId, groupId, typeId);
    }

    /**
     * Get public asset information (no authentication required)
     * Returns only basic information: status, location, and image availability
     * 
     * @param id - Asset ID
     * @returns Public asset DTO with basic info
     */
    @Get('public/:id')
    async getPublicAsset(@Param('id') id: string): Promise<PublicAssetDto> {
        return this.assetsService.getPublicAsset(id);
    }

    /**
     * Stream public asset image (no authentication required)
     * 
     * @param id - Asset ID
     * @param res - Express response object
     * @returns Streamable file
     */
    @Get('public/:id/image')
    async streamPublicAssetImage(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        return this.assetsService.streamPublicAssetImage(id, res);
    }

    // ========================================
    // DYNAMIC ROUTES WITH PARAMETERS
    // ========================================

    @Get('roomsByOffice/:officeId')
    async getRoomsByOffice(@Param('officeId') officeId: string): Promise<Room[]> {
        return this.assetsService.getRoom(officeId);
    }

    @Get('assetTypesByGroup/:groupId')
    async getAssetsTypeByGroup(@Param('groupId') groupId: string): Promise<AssetType[]> {
        return this.assetsService.getAssetTypeByGroup(groupId);
    }

    /**
     * Get office with all rooms (for floorplan editor)
     * @param officeId - Office UUID
     * @returns Office with rooms array
     */
    @Get('office/:officeId/with-rooms')
    @UseGuards(EnhancedJwtAuthGuard)
    async getOfficeWithRooms(@Param('officeId') officeId: string): Promise<Office & { rooms: Room[] }> {
        return this.assetsService.getOfficeWithRooms(officeId);
    }

    /**
     * Update office floorplan data
     * @param officeId - Office UUID
     * @param updateDto - Floorplan data
     * @returns Updated office
     */
    @Patch('office/:officeId/floorplan')
    @UseGuards(EnhancedJwtAuthGuard)
    async updateOfficeFloorplan(
        @Param('officeId') officeId: string,
        @Body() updateDto: UpdateOfficeFloorplanDto,
    ): Promise<Office> {
        return this.assetsService.updateOfficeFloorplan(officeId, updateDto);
    }

    /**
     * Update room floorplan SVG data
     * @param roomId - Room UUID
     * @param updateDto - Room SVG data
     * @returns Updated room
     */
    @Patch('room/:roomId/floorplan')
    @UseGuards(EnhancedJwtAuthGuard)
    async updateRoomFloorplan(
        @Param('roomId') roomId: string,
        @Body() updateDto: UpdateRoomFloorplanDto,
    ): Promise<Room> {
        return this.assetsService.updateRoomFloorplan(roomId, updateDto);
    }

    /**
     * Get presigned URLs for all asset files
     * Provides secure, time-limited access to asset images and documents
     * 
     * @param id - Asset ID
     * @param req - Request with user info
     * @returns Presigned URLs for all asset files with expiry time
     */
    @Get(':id/files')
    @UseGuards(EnhancedJwtAuthGuard)
    async getAssetFiles(
        @Param('id') id: string,
        @Request() req,
    ): Promise<{
        photoUrl: string | null;
        invoiceFileUrl: string | null;
        taxInvoiceFileUrl: string | null;
        expiresAt: Date;
    }> {
        // Extract user ID from request (from JWT/session)
        const userId = req.user?.sub || req.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        return this.assetsService.getAssetFileUrls(id, userId);
    }

    /**
     * Get presigned URL for a specific file type
     * Provides secure, time-limited access to a single file
     * 
     * @param id - Asset ID
     * @param fileType - Type of file (photo, invoice, taxInvoice)
     * @param req - Request with user info
     * @returns Presigned URL for the specific file with expiry time
     */
    @Get(':id/file/:type')
    @UseGuards(EnhancedJwtAuthGuard)
    async getAssetFile(
        @Param('id') id: string,
        @Param('type') fileType: 'photo' | 'invoice' | 'taxInvoice',
        @Request() req,
    ): Promise<{ url: string; expiresAt: Date }> {
        const userId = req.user?.sub || req.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        const urls = await this.assetsService.getAssetFileUrls(id, userId);

        let url: string | null = null;
        switch (fileType) {
            case 'photo':
                url = urls.photoUrl;
                break;
            case 'invoice':
                url = urls.invoiceFileUrl;
                break;
            case 'taxInvoice':
                url = urls.taxInvoiceFileUrl;
                break;
        }

        if (!url) {
            throw new NotFoundException(`File ${fileType} not found for asset ${id}`);
        }

        return { url, expiresAt: urls.expiresAt };
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Asset> {
        return this.assetsService.findById(id);
    }

    @Post('create')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'assetImage', maxCount: 1 },
            { name: 'invoiceFile', maxCount: 1 },
            { name: 'taxInvoiceFile', maxCount: 1 },
        ], {
            limits: {
                fileSize: 20 * 1024 * 1024, // 20MB max file size
            },
        }),
    )
    async createAsset(
        @Body() createAssetDto: CreateAssetDto,
        @UploadedFiles() files?: {
            assetImage?: Express.Multer.File[];
            invoiceFile?: Express.Multer.File[];
            taxInvoiceFile?: Express.Multer.File[];
        },
    ): Promise<Asset> {
        return this.assetsService.createAssetWithFiles(createAssetDto, files);
    }

    // ========================================
    // ASSET HISTORY ENDPOINTS
    // NOTE: Not connected to frontend yet
    // ========================================

    /**
     * Create manual history event
     * POST /assets/:id/history
     * NOTE: Not connected yet - for manual maintenance events
     */
    @Post(':id/history')
    @UseInterceptors(FilesInterceptor('documents', 10))
    async createHistoryEvent(
        @Param('id') assetId: string,
        @Body() dto: CreateAssetHistoryDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req,
    ): Promise<AssetHistory> {
        // Use authenticated user ID, or fall back to approver ID if no user session
        const userId = req.user?.sub || dto.approvedBy;

        return this.assetsService.createHistoryEvent(
            assetId,
            dto,
            files,
            userId,
        );
    }

    /**
     * Get asset history with filters
     * GET /assets/:id/history
     * NOTE: Not connected yet - for history timeline page
     */
    @Get(':id/history')
    async getAssetHistory(
        @Param('id') assetId: string,
        @Query() queryDto: QueryAssetHistoryDto,
    ): Promise<{
        data: AssetHistory[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        return this.assetsService.getAssetHistory(assetId, queryDto);
    }

    /**
     * Get presigned URLs for history event documents
     * GET /assets/history/:historyId/documents
     * NOTE: Not connected yet - for document downloads
     */
    @Get('history/:historyId/documents')
    async getHistoryDocuments(@Param('historyId') historyId: string): Promise<Record<string, string>> {
        return this.assetsService.getHistoryDocumentUrls(historyId);
    }
}