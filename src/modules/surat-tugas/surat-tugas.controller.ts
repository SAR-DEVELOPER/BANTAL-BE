import { Controller, Get, Post, Body, Query } from '@nestjs/common';
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

  @Get('get-all')
  async getAll(): Promise<SuratTugas[]> {
    return this.suratTugasService.getAll();
  }

  //@Get('get-by-id/:id')
  //async getById(@Param('id', ParseUUIDPipe) id: string): Promise<SuratTugas> {
  //  return this.suratTugasService.getById(id);
  //}

  //@Get('get-by-master-document-list-id/:masterDocumentListId')
  //async getByMasterDocumentListId(@Param('masterDocumentListId', ParseUUIDPipe) masterDocumentListId: string): Promise<SuratTugas[]> {
  //  return this.suratTugasService.getByMasterDocumentListId(masterDocumentListId);
  //}

  @Get('current-number')
  async index(@Query('month') month?: string, @Query('year') year?: string): Promise<string> {
    const now = new Date();
    let monthNum: number = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let yearNum: number = now.getFullYear();

    // Override with provided parameters if they exist
    if (month) {
      monthNum = parseInt(month, 10);
    }
    if (year) {
      yearNum = parseInt(year, 10);
    }
    return this.suratTugasService.currentNumber(monthNum, yearNum);
  }

  @Post('create')
  async create(@Body() createSuratTugasDto: CreateSuratTugasDto): Promise<SuratTugas> {
    return this.suratTugasService.create(createSuratTugasDto);
  }
}