import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity()
export class HostKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'host_key', type: 'varchar', length: 255 })
    hostKey: string;

    @Column({ name: 'set_time', type: 'timestamp' })
    setTime: Date;

    @Column({ name: 'expired_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}