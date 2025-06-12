import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pekerjaan } from './entities/pekerjaan.entity';
import { CreatePekerjaanDto } from './dto/create-pekerjaan.dto';

@Injectable()
export class PekerjaanService {
  private readonly logger = new Logger(PekerjaanService.name);

  constructor(
    @InjectRepository(Pekerjaan)
    private pekerjaanRepository: Repository<Pekerjaan>,
  ) {}

  /**
   * Create a new pekerjaan with the given data
   */
  async create(createPekerjaanDto: CreatePekerjaanDto): Promise<Pekerjaan> {
    const pekerjaan = this.pekerjaanRepository.create(createPekerjaanDto);
    return await this.pekerjaanRepository.save(pekerjaan);
  }

  /**
   * Create a new non-monthly work from SPK document
   * This is triggered when an SPK document is finalized
   */
  async createNonMonthlyWork(documentName: string, spkId: string): Promise<Pekerjaan> {
    this.logger.debug(`Creating non-monthly work for SPK: ${spkId}`);
    
    const pekerjaan = this.pekerjaanRepository.create({
      projectName: documentName,
      spkId: spkId,
      teamMemberStructure: {},
      paymentStructure: {}
    });

    const savedPekerjaan = await this.pekerjaanRepository.save(pekerjaan);
    this.logger.debug(`Created non-monthly work with ID: ${savedPekerjaan.id}`);
    return savedPekerjaan;
  }

  /**
   * Create a new monthly work from SPK document
   * This is triggered when an SPK document is finalized
   */
  async createMonthlyWork(documentName: string, spkId: string): Promise<Pekerjaan> {
    this.logger.debug(`Creating monthly work for SPK: ${spkId}`);
    
    const pekerjaan = this.pekerjaanRepository.create({
      projectName: documentName,
      spkId: spkId,
      teamMemberStructure: {},
      paymentStructure: {}
    });

    const savedPekerjaan = await this.pekerjaanRepository.save(pekerjaan);
    this.logger.debug(`Created monthly work with ID: ${savedPekerjaan.id}`);
    return savedPekerjaan;
  }

  async findAll(): Promise<Pekerjaan[]> {
    return await this.pekerjaanRepository.find();
  }

  async findOne(id: string): Promise<Pekerjaan | null> {
    return await this.pekerjaanRepository.findOne({ where: { id } });
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: 'ok' };
  }


} 