import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseVersionedDocument } from 'src/modules/document/core/entities/base-versioned-document.entity';
import { Schemas } from 'src/config/schema.config';
import { SuratTugas } from './surat-tugas.entity';
import { Identity } from '@modules/identity/core/entities/identity.entity';

@Entity('tim_penugasan', { schema: Schemas.DOCUMENT })
export class TimPenugasan extends BaseVersionedDocument {
    @ManyToOne(() => SuratTugas, { nullable: false })
    @JoinColumn({ name: 'surat_tugas_id' })
    suratTugas: SuratTugas;

    @ManyToOne(() => Identity, { nullable: false })
    @JoinColumn({ name: 'personnel_id' })
    personnel: Identity;

    @Column({ name: 'role' })
    role: string;

    @Column({ name: 'created_at' })
    createdAt: Date;
    
}