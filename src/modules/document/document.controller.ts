import { Controller, Get, Post, Body, Param, NotFoundException, Query, UseInterceptors, UploadedFile, Res, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentCreateDto } from './core/dto/document-create.dto';
import { DocumentListDto } from './core/dto/document-list.dto';
import { MasterDocumentList } from './core/entities';
import { DocumentFinalizeDto } from './core/dto/document-finalize.dto';
import 'multer';
import { Response } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Get welcome message (for testing)
   * @returns Welcome message
   */
  @Get('hello')
  getHello(): any {
    return this.documentService.getHello();
  }

  /**
   * Get all documents
   * @returns List of all documents with related entity data
   */
  @Get()
  async findAll(): Promise<DocumentListDto[]> {
    return this.documentService.findAll();
  }

  /**
   * Get document by ID
   * @param id Document UUID
   * @returns Document with the specified ID and its related entity data
   * @throws NotFoundException if document with the specified ID is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<DocumentListDto> {
    try {
      return await this.documentService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
  }

  /**
   * Get the latest index number for a given document type
   * @param shortHand The short hand of the document type
   * @param month Optional month (1-12) to filter by
   * @param year Optional year to filter by
   * @param companyId Optional company ID to filter by
   * @returns Latest index number for the document type
   */
  @Get('latest-index-number/:shortHand')
  async getLatestIndexNumber(
    @Param('shortHand') shortHand: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('companyId') companyId?: string,
  ): Promise<number> {
    const monthValue = month ? parseInt(month, 10) : undefined;
    const yearValue = year ? parseInt(year, 10) : undefined;
    
    return this.documentService.getLatestIndexNumber(shortHand, monthValue, yearValue, companyId);
  }

  /**
   * Get all documents by document type shorthand
   * @param shorthand The shorthand of the document type
   * @returns List of documents with the specified document type
   * @throws NotFoundException if document type with the specified shorthand is not found
   */
  @Get('list/:shorthand')
  async findByShortHand(@Param('shorthand') shorthand: string): Promise<DocumentListDto[]> {
    return this.documentService.findByShortHand(shorthand);
  }

  /**
   * Create a new document
   * @param documentType Document type name or shorthand
   * @param documentData Document data
   * @returns Created document
   */
  @Post('create/:documentType')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  }))
  async createDocument(
    @Param('documentType') documentType: string,
    @Body() documentData: DocumentCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MasterDocumentList> {
    // Attach file to documentData if provided
    if (file) {
      documentData.file = file;
    }
    return this.documentService.createDocument(documentType, documentData);
  }

  /**
   * Download document by ID
   * @param id Document UUID
   * @param res Express response object
   * @returns Document file stream
   * @throws NotFoundException if document with the specified ID is not found
   */
  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { content, mimeType, filename } = await this.documentService.getDocumentContent(id);
    
    if (!content) {
      throw new NotFoundException(`Document content not found for ID "${id}"`);
    }

    // Set headers for file download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', content.length);
    
    // Send the file
    res.send(content);
  }

  /**
   * Finalize a document
   * @param finalizeData Document finalization data
   * @param files Optional files to be attached
   * @returns Finalized document information
   */
  @Post('finalize')
  @UseInterceptors(FilesInterceptor('files', 2))
  async finalizeDocument(
    @Body() finalizeData: DocumentFinalizeDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<{ message: string; document: DocumentListDto }> {
    return this.documentService.finalizeDocument(
      finalizeData.id,
      finalizeData.finalizationSummary,
      finalizeData.physicalDelivery,
      files
    );
  }
}
