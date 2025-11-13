import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Check,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { Identity } from '@modules/identity/core/entities/identity.entity';

@Entity('meeting_participant')
@Check(`("participant_id" IS NOT NULL AND "email" IS NULL) OR ("participant_id" IS NULL AND "email" IS NOT NULL)`)
export class MeetingParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meeting, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @Column({ name: 'meeting_id', type: 'uuid' })
  meetingId: string;

  @ManyToOne(() => Identity, { nullable: true })
  @JoinColumn({ name: 'participant_id' })
  participant: Identity | null;

  @Column({ name: 'participant_id', type: 'uuid', nullable: true })
  participantId: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

