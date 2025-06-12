import { Controller, Get, Param, NotFoundException, Post, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { Identity } from './core/entities/identity.entity';
import { Request } from 'express';

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
   * Search users by various criteria
   */
  @Get('search')
  async searchUsers(
    @Query('email') email?: string,
    @Query('department') department?: string,
    @Query('role') role?: string,
    @Query('status') status?: string
  ): Promise<Identity[]> {
    const identityRepo = this.identityService['identityRepository'];
    const query = identityRepo.createQueryBuilder('identity');

    if (email) {
      query.andWhere('identity.email ILIKE :email', { email: `%${email}%` });
    }
    if (department) {
      query.andWhere('identity.department ILIKE :department', { department: `%${department}%` });
    }
    if (role) {
      query.andWhere('identity.role = :role', { role });
    }
    if (status) {
      query.andWhere('identity.status = :status', { status });
    }

    return query.getMany();
  }

  /**
   * Get identity by email
   * @param email User email
   * @returns Identity with the specified email
   */
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Identity | null> {
    return this.identityService.findByEmail(email);
  }

  /**
   * Get identity by Keycloak ID
   * @param keycloakId Keycloak user ID
   * @returns Identity with the specified Keycloak ID
   */
  @Get('keycloak/:keycloakId')
  async findByKeycloakId(@Param('keycloakId') keycloakId: string): Promise<Identity | null> {
    return this.identityService.findByKeycloakId(keycloakId);
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

  /**
   * Update user status (active/inactive)
   */
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateData: { isActive: boolean; status: 'active' | 'inactive' | 'pending' }
  ): Promise<Identity> {
    const identity = await this.identityService.findById(id);
    identity.isActive = updateData.isActive;
    identity.status = updateData.status;
    
    // Save through the repository
    const identityRepo = this.identityService['identityRepository'];
    return identityRepo.save(identity);
  }

  /**
   * Manually sync Keycloak ID for a user (for troubleshooting)
   */
  @Patch(':id/sync-keycloak')
  async syncKeycloakId(
    @Param('id') id: string,
    @Body() updateData: { keycloakId: string }
  ): Promise<Identity> {
    const identity = await this.identityService.findById(id);
    const oldKeycloakId = identity.keycloakId;
    identity.keycloakId = updateData.keycloakId;
    
    // Save through the repository
    const identityRepo = this.identityService['identityRepository'];
    const savedIdentity = await identityRepo.save(identity);
    
    console.log(`Manually synced Keycloak ID for user ${identity.email}: ${oldKeycloakId} -> ${updateData.keycloakId}`);
    
    return savedIdentity;
  }
}
