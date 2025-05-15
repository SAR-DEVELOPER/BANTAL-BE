import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('identity')
export class Identity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string; // Internal primary key

  @Column({ type: 'varchar', length: 255, name: 'external_id', unique: true })
  @Index()
  externalId: string; // Entra ID Object ID (Microsoft Graph)

  @Column({ type: 'varchar', length: 255, name: 'keycloak_id', nullable: true, unique: true })
  @Index()
  keycloakId: string; // Keycloak internal UUID (from token 'sub')

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string; // Must match Entra ID mail or userPrincipalName

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string; // Display name (from Entra)

  @Column({ type: 'varchar', length: 255, name: 'department', nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 255, name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255, name: 'preferred_username', nullable: true })
  preferredUsername: string; // Optional: Could store UPN or any custom username

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'pending';

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}
