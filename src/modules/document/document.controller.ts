import { Controller, Get } from '@nestjs/common';
import { DocumentService } from './document.service';
import { Injectable } from '@nestjs/common';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  getHello(): any {
    return this.documentService.getHello();
  }
}
