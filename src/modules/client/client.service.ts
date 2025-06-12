import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterClientList } from 'src/entities/master-client-list.entity';
import { ClientType } from 'src/entities/client-type.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(MasterClientList)
    private masterClientListRepository: Repository<MasterClientList>,
    @InjectRepository(ClientType)
    private clientTypeRepository: Repository<ClientType>,
  ) {}

  /**
   * Find all clients with their associated client types
   * @returns All clients with their type information
   */
  async findAllClients(): Promise<MasterClientList[]> {
    return this.masterClientListRepository.find({
      relations: ['type'],
    });
  }

  /**
   * Find all client types
   * @returns All client types
   */
  async findAllClientTypes(): Promise<ClientType[]> {
    return this.clientTypeRepository.find();
  }

  /**
   * Find a client by ID
   * @param id Client ID
   * @returns Client with the specified ID
   * @throws NotFoundException if client with the specified ID is not found
   */
  async findClientById(id: string): Promise<MasterClientList> {
    const client = await this.masterClientListRepository.findOne({
      where: { id },
      relations: ['type'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }

    return client;
  }

  /**
   * Find a client type by ID
   * @param id Client type ID
   * @returns Client type with the specified ID
   * @throws NotFoundException if client type with the specified ID is not found
   */
  async findClientTypeById(id: number): Promise<ClientType> {
    const clientType = await this.clientTypeRepository.findOne({
      where: { id },
    });

    if (!clientType) {
      throw new NotFoundException(`Client type with ID "${id}" not found`);
    }

    return clientType;
  }
} 