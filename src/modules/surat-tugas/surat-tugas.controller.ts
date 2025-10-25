import { Controller, Get, Post, Body } from '@nestjs/common';
import { SuratTugasService } from './surat-tugas.service';
import { CreateSuratTugasDto } from './dto/create-surat-tugas.dto';
import { SuratTugas } from 'src/entities/surat-tugas.entity';

@Controller('surat-tugas')
export class SuratTugasController {
  constructor(private readonly suratTugasService: SuratTugasService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      message: 'Surat Tugas service is healthy',
    };
  }

  @Post('create')
  async create(@Body() createSuratTugasDto: CreateSuratTugasDto): Promise<SuratTugas> {
    console.log(createSuratTugasDto);
    return this.suratTugasService.create(createSuratTugasDto);
  }
}