import { Controller, Get, Post, Body, Param, NotFoundException, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentCreateDto } from './core/dto/document-create.dto';
import { DocumentListDto } from './core/dto/document-list.dto';
import { MasterDocumentList } from './core/entities';
import 'multer';

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
   * @returns Latest index number for the document type
   */
  @Get('latest-index-number/:shortHand')
  async getLatestIndexNumber(
    @Param('shortHand') shortHand: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<number> {
    const monthValue = month ? parseInt(month, 10) : undefined;
    const yearValue = year ? parseInt(year, 10) : undefined;
    
    return this.documentService.getLatestIndexNumber(shortHand, monthValue, yearValue);
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
}
