import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Office } from './office.entity';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_code', type: 'varchar', length: 255 })
  roomCode: string;

  @ManyToOne(() => Office, { nullable: false })
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'svg_path', type: 'text', nullable: true })
  svgPath: string | null;

  @Column({ name: 'svg_fill_color', type: 'varchar', length: 50, nullable: true, default: '#e0e0e0' })
  svgFillColor: string;

  @Column({ name: 'svg_label_x', type: 'float', nullable: true })
  svgLabelX: number | null;

  @Column({ name: 'svg_label_y', type: 'float', nullable: true })
  svgLabelY: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}