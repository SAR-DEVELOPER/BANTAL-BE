import { Controller, Get, Param, NotFoundException, Post } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { Identity } from './core/entities/identity.entity';

@Controller('identities')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  /**
   * Get all identities
   * @returns All identities
   */
  @Get()
  async findAll(): Promise<Identity[]> {
    return this.identityService.findAll();
  }

  /**
   * Get identity by ID
   * @param id Identity UUID
   * @returns Identity with the specified ID
   * @throws NotFoundException if identity with the specified ID is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Identity> {
    try {
      return await this.identityService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Identity with ID "${id}" not found`);
    }
  }

  /**
   * Import Microsoft users into the identity table
   */
  @Post('import-microsoft-users')
  async importMicrosoftUsers() {
    return this.identityService.importMicrosoftUsers();
  }
}
