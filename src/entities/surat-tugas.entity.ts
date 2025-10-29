import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseVersionedDocument } from 'src/modules/document/core/entities/base-versioned-document.entity';
import { Schemas } from 'src/config/schema.config';
import { MasterClientList } from './master-client-list.entity';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { MasterDocumentList } from '@modules/document/core/entities/master-document-list.entity';
import { TimPenugasan } from './tim-penugasan.entity';

@Entity('surat_tugas', { schema: Schemas.DOCUMENT })
export class SuratTugas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MasterDocumentList, { nullable: true })
  @JoinColumn({ name: 'master_document_list_id' })
  masterDocumentList: MasterDocumentList | null;

  @Column({ name: 'nama_pekerjaan' })
  namaPekerjaan: string;

  @Column({ name: 'deskripsi_pekerjaan' })
  deskripsiPekerjaan: string;

  @Column({ name: 'tanggal_mulai', type: 'timestamp', nullable: false })
  tanggalMulai: Date;
  
  @Column({ name: 'tanggal_selesai', type: 'timestamp', nullable: false })
  tanggalSelesai: Date;

  @Column({ name: 'lokasi' })
  lokasi: string;

  @ManyToOne(() => MasterClientList)
  @JoinColumn({ name: 'client_id' })
  client: MasterClientList;

  @Column({ name: 'type' })
  type: string;

  @ManyToOne(() => Identity)
  @JoinColumn({ name: 'signer' })
  signer: Identity;

  @Column({ name: 'tanggal_surat_tugas', type: 'timestamp', nullable: false })
  tanggalSuratTugas: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by' })
  updatedBy: string;

  @OneToMany(() => TimPenugasan, (timPenugasan) => timPenugasan.suratTugas)
  timPenugasan: TimPenugasan[];
}