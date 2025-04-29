import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';

@Injectable()
export class DivisionService {
  constructor(
    @InjectRepository(MasterDivisionList)
    private masterDivisionListRepository: Repository<MasterDivisionList>,
  ) {}

  /**
   * Find all divisions
   * @returns All divisions
   */
  async findAll(): Promise<MasterDivisionList[]> {
    return this.masterDivisionListRepository.find();
  }

  /**
   * Find a division by ID
   * @param id Division UUID
   * @returns Division with the specified ID
   * @throws NotFoundException if division with the specified ID is not found
   */
  async findById(id: string): Promise<MasterDivisionList> {
    const division = await this.masterDivisionListRepository.findOne({
      where: { id }
    });

    if (!division) {
      throw new NotFoundException(`Division with ID "${id}" not found`);
    }

    return division;
  }
} 