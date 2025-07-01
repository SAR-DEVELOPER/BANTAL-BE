import { Controller, Get, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { SuratPerjanjianKerjaService } from './document-type/surat-perjanjian-kerja.service';
import { SuratPerjanjianKerja } from './core/entities/documentType/surat-perjanjian-kerja.entity';

@Controller('documents/spk')
export class SuratPerjanjianKerjaController {
  constructor(private readonly suratPerjanjianKerjaService: SuratPerjanjianKerjaService) {}

  /**
   * Get SPK document by ID
   * @param id SPK document UUID
   * @returns SPK document with all related data
   * @throws NotFoundException if SPK document with the specified ID is not found
   */
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<SuratPerjanjianKerja> {
    try {
      return await this.suratPerjanjianKerjaService.getById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`SPK document with ID "${id}" not found`);
    }
  }
} 