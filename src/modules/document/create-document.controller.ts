import { Controller, Post, Body, Param } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentCreateDto } from './core/dto/document-create.dto';
import { MasterDocumentList } from './core/entities';

@Controller('documents/create')
export class CreateDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Create a new document
   * @param documentType Document type name or shorthand
   * @param documentData Document data
   * @returns Created document
   */
  @Post(':documentType')
  createDocument(
    @Param('documentType') documentType: string,
    @Body() documentData: DocumentCreateDto,
  ): Promise<MasterDocumentList> {
    console.log('Creating document through separate controller');
    return this.documentService.createDocument(documentType, documentData);
  }
} 