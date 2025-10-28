import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuratTugas } from 'src/entities/surat-tugas.entity';
import { CreateSuratTugasDto } from './dto/create-surat-tugas.dto';
import { MasterDocumentList } from '@modules/document/core/entities/master-document-list.entity';
import { DocumentStatus } from '@modules/document/core/enums/document-status.enum';

@Injectable()
export class SuratTugasService {
  constructor(
    @InjectRepository(SuratTugas)
    private suratTugasRepository: Repository<SuratTugas>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
  ) {}

  async create(createSuratTugasDto: CreateSuratTugasDto): Promise<SuratTugas> {
    const legalDate = new Date(createSuratTugasDto.tanggalSuratTugas);
    const nextIndexStr = await this.currentNumber(
      legalDate.getMonth() + 1,
      legalDate.getFullYear(),
    );

    const masterDocument = this.masterDocumentListRepository.create({
      documentNumber: createSuratTugasDto.masterDocumentListId,
      documentExternalNumber: '',
      documentName: 'Surat Tugas ' + createSuratTugasDto.namaPekerjaan,
      documentLegalDate: legalDate.toISOString(),
      indexNumber: Number(nextIndexStr),
      createdBy: { id: createSuratTugasDto.createdBy },
    });
    const savedMasterDocument = await this.masterDocumentListRepository.save(masterDocument);
    const data = {
      masterDocumentList: { id: savedMasterDocument.id },
      namaPekerjaan: createSuratTugasDto.namaPekerjaan,
      deskripsiPekerjaan: createSuratTugasDto.deskripsiPekerjaan,
      tanggalMulai: createSuratTugasDto.tanggalMulai,
      tanggalSelesai: createSuratTugasDto.tanggalSelesai,
      lokasi: createSuratTugasDto.lokasi,
      client: { id: createSuratTugasDto.clientId },
      type: createSuratTugasDto.type,
      signer: { id: createSuratTugasDto.signerId },
      tanggalSuratTugas: legalDate,
      createdBy: createSuratTugasDto.createdBy,
      updatedBy: createSuratTugasDto.createdBy,
    };

    console.log("---------------------------------data---------------------------------");
    console.log(data);
    console.log("---------------------------------data---------------------------------");

    const suratTugas = await this.suratTugasRepository.save(data);
    console.log(suratTugas);
    return suratTugas;
  }

  async getAll(): Promise<SuratTugas[]> {
    return this.suratTugasRepository.find({
      relations: [
        'masterDocumentList',
        'client',
        'signer',
      ],
    });
  }

  async currentNumber(month: number, year: number): Promise<string> {
    const count = await this.suratTugasRepository
      .createQueryBuilder('surat_tugas')
      .where('EXTRACT(YEAR FROM surat_tugas.tanggal_surat_tugas) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM surat_tugas.tanggal_surat_tugas) = :month', { month })
      .getCount();

    return (count + 1).toString();
  }
}