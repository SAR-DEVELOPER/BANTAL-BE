import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuratTugas } from 'src/entities/surat-tugas.entity';
import { CreateSuratTugasDto } from './dto/create-surat-tugas.dto';

@Injectable()
export class SuratTugasService {
  constructor(
    @InjectRepository(SuratTugas)
    private suratTugasRepository: Repository<SuratTugas>,
  ) {}

  async create(createSuratTugasDto: CreateSuratTugasDto): Promise<SuratTugas> {
    const data = {
      namaPekerjaan: createSuratTugasDto.namaPekerjaan,
      deskripsiPekerjaan: createSuratTugasDto.deskripsiPekerjaan,
      tanggalMulai: createSuratTugasDto.tanggalMulai,
      tanggalSelesai: createSuratTugasDto.tanggalSelesai,
      lokasi: createSuratTugasDto.lokasi,
      client: { id: createSuratTugasDto.clientId },
      type: createSuratTugasDto.type,
      signer: { id: createSuratTugasDto.signerId },
      tanggalSuratTugas: createSuratTugasDto.tanggalSuratTugas,
      createdBy: createSuratTugasDto.createdBy,
      updatedBy: createSuratTugasDto.createdBy,
    };

    console.log(data);

    const suratTugas = await this.suratTugasRepository.save(data);
    console.log(suratTugas);
    return suratTugas;
  }
}