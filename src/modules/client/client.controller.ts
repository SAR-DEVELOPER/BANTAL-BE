import { Controller, Get, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { MasterClientList } from 'src/entities/master-client-list.entity';
import { ClientType } from 'src/entities/client-type.entity';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Get all clients with their type information
   * @returns All clients with their associated client types
   */
  @Get()
  async findAllClients(): Promise<MasterClientList[]> {
    return this.clientService.findAllClients();
  }

  /**
   * Get all client types
   * @returns All client types
   */
  @Get('types')
  async findAllClientTypes(): Promise<ClientType[]> {
    return this.clientService.findAllClientTypes();
  }

  /**
   * Get client by ID
   * @param id Client ID
   * @returns Client with the specified ID
   * @throws NotFoundException if client with the specified ID is not found
   */
  @Get(':id')
  async findClientById(@Param('id') id: string): Promise<MasterClientList> {
    try {
      return await this.clientService.findClientById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
  }

  /**
   * Get client type by ID
   * @param id Client type ID
   * @returns Client type with the specified ID
   * @throws NotFoundException if client type with the specified ID is not found
   */
  @Get('types/:id')
  async findClientTypeById(@Param('id', ParseIntPipe) id: number): Promise<ClientType> {
    try {
      return await this.clientService.findClientTypeById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Client type with ID "${id}" not found`);
    }
  }
} 