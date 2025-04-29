import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Get all companies
   * @returns All companies
   */
  @Get()
  async findAll(): Promise<MasterCompanyList[]> {
    return this.companyService.findAll();
  }

  /**
   * Get company by ID
   * @param id Company UUID
   * @returns Company with the specified ID
   * @throws NotFoundException if company with the specified ID is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<MasterCompanyList> {
    try {
      return await this.companyService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
  }
} 