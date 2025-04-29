import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DivisionService } from './division.service';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';

@Controller('divisions')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  /**
   * Get all divisions
   * @returns All divisions
   */
  @Get()
  async findAll(): Promise<MasterDivisionList[]> {
    return this.divisionService.findAll();
  }

  /**
   * Get division by ID
   * @param id Division UUID
   * @returns Division with the specified ID
   * @throws NotFoundException if division with the specified ID is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<MasterDivisionList> {
    try {
      return await this.divisionService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Division with ID "${id}" not found`);
    }
  }
} 