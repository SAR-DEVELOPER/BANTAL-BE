import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { PekerjaanService } from './pekerjaan.service';
import { CreatePekerjaanDto } from './dto/create-pekerjaan.dto';
import { Pekerjaan } from './entities/pekerjaan.entity';

@Controller('pekerjaan')
export class PekerjaanController {
  constructor(private readonly pekerjaanService: PekerjaanService) {}

  @Post()
  create(@Body() createPekerjaanDto: CreatePekerjaanDto): Promise<Pekerjaan> {
    return this.pekerjaanService.create(createPekerjaanDto);
  }

  @Get()
  findAll(): Promise<Pekerjaan[]> {
    return this.pekerjaanService.findAll();
  }

  @Get('health')
  healthCheck() {
    return this.pekerjaanService.healthCheck();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Pekerjaan> {
    const pekerjaan = await this.pekerjaanService.findOne(id);
    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${id} not found`);
    }
    return pekerjaan;
  }
} 