import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(MasterCompanyList)
    private masterCompanyListRepository: Repository<MasterCompanyList>,
  ) {}

  /**
   * Find all companies
   * @returns All companies
   */
  async findAll(): Promise<MasterCompanyList[]> {
    return this.masterCompanyListRepository.find();
  }

  /**
   * Find a company by ID
   * @param id Company UUID
   * @returns Company with the specified ID
   * @throws NotFoundException if company with the specified ID is not found
   */
  async findById(id: string): Promise<MasterCompanyList> {
    const company = await this.masterCompanyListRepository.findOne({
      where: { id }
    });

    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }

    return company;
  }
} 