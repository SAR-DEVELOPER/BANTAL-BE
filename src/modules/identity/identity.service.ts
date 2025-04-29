import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from './core/entities/identity.entity';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

  /**
   * Find all identities
   * @returns All identities
   */
  async findAll(): Promise<Identity[]> {
    return this.identityRepository.find();
  }

  /**
   * Find an identity by ID
   * @param id Identity UUID
   * @returns Identity with the specified ID
   * @throws NotFoundException if identity with the specified ID is not found
   */
  async findById(id: string): Promise<Identity> {
    const identity = await this.identityRepository.findOne({
      where: { id }
    });

    if (!identity) {
      throw new NotFoundException(`Identity with ID "${id}" not found`);
    }

    return identity;
  }
}
