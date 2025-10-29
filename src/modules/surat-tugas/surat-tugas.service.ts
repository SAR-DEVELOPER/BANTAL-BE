import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuratTugas } from 'src/entities/surat-tugas.entity';
import { CreateSuratTugasDto } from './dto/create-surat-tugas.dto';
import { MasterDocumentList } from '@modules/document/core/entities/master-document-list.entity';
import { DocumentStatus } from '@modules/document/core/enums/document-status.enum';
import { TimPenugasan } from 'src/entities/tim-penugasan.entity';

@Injectable()
export class SuratTugasService {
  constructor(
    @InjectRepository(SuratTugas)
    private suratTugasRepository: Repository<SuratTugas>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    @InjectRepository(TimPenugasan)
    private timPenugasanRepository: Repository<TimPenugasan>,
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

    const suratTugas = await this.suratTugasRepository.save(data);
    console.log(suratTugas);

    if(suratTugas && createSuratTugasDto.timPenugasan) {
      const timPenugasanPromises = createSuratTugasDto.timPenugasan.map(async (tim) => {
        const timPenugasan = this.timPenugasanRepository.create({
          suratTugas: { id: suratTugas.id },
          personnel: { id: tim.personnelId },
          role: tim.role,
          createdAt: new Date(),
        });
        return await this.timPenugasanRepository.save(timPenugasan);
      });
      await Promise.all(timPenugasanPromises);
    }
    
    return suratTugas;
  }

  async getAll(): Promise<SuratTugas[]> {
    return this.suratTugasRepository.find({
      relations: [
        'masterDocumentList',
        'client',
        'signer',
        'timPenugasan',
        'timPenugasan.personnel',
      ],
    });
  }

  async getById(id: string): Promise<SuratTugas> {
    const suratTugas = await this.suratTugasRepository.findOne({
      where: { id },
      relations: [
        'masterDocumentList',
        'client',
        'signer',
        'timPenugasan',
        'timPenugasan.personnel',
      ],
    });
    if (!suratTugas) {
      throw new NotFoundException('Surat Tugas not found');
    }
    return suratTugas;
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