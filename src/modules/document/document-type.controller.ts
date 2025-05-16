// src/modules/document/document-type.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DocumentTypeService } from './document-type.service';

@Controller('document-types')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  findAll() {
    return this.documentTypeService.findAll();
  }

  @Get('raw')
  async findAllRaw() {
    return this.documentTypeService.findAllRawSql();
  }
}
