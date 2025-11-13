import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Identity } from '@modules/identity/core/entities/identity.entity';

export enum MeetingStatus {
    SCHEDULED = 'scheduled',
    LIVE = 'live',
    FINISHED = 'finished',
    CANCELLED = 'cancelled',
}

@Entity('meeting')
export class Meeting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'meeting_title', type: 'varchar', length: 500 })
    meetingTitle: string;

    @Column({ name: 'time_start', type: 'timestamp' })
    timeStart: Date;

    @Column({ name: 'time_end', type: 'timestamp' })
    timeEnd: Date;

    @Column({ name: 'host_claim_key', type: 'varchar', length: 255, nullable: true })
    hostClaimKey: string | null;

    @Column({
        name: 'status',
        type: 'enum',
        enum: MeetingStatus,
        default: MeetingStatus.SCHEDULED,
    })
    status: MeetingStatus;

    @Column({ name: 'start_url', type: 'text', nullable: true })
    startUrl: string | null;

    @Column({ name: 'join_url', type: 'text', nullable: true })
    joinUrl: string | null;

    @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
    password: string | null;

    @ManyToOne(() => Identity, { nullable: true })
    @JoinColumn({ name: 'requested_by' })
    requestedBy: Identity | null;

    @Column({ name: 'requested_by', type: 'uuid', nullable: true })
    requestedById: string | null;

    @Column({ name: 'zoom_id', type: 'varchar', length: 255, nullable: true })
    zoomId: string | null;

    @Column({ name: 'host_id', type: 'uuid', nullable: true })
    hostId: string | null;

    @Column({ name: 'internal_attendant_ids', type: 'uuid', array: true, default: [] })
    internalAttendantIds: string[];

    @Column({ name: 'email_attendants', type: 'varchar', array: true, default: [] })
    emailAttendants: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

