import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from './core/entities/identity.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private configService: ConfigService,
  ) {}

  /**
   * Find all identities
   * @returns All identities
   */
  async findAll(): Promise<Identity[]> {
    return this.identityRepository.find();
  }

  /**
   * Find an identity by ID
   * @param id Identity UUID
   * @returns Identity with the specified ID
   * @throws NotFoundException if identity with the specified ID is not found
   */
  async findById(id: string): Promise<Identity> {
    const identity = await this.identityRepository.findOne({
      where: { id }
    });

    if (!identity) {
      throw new NotFoundException(`Identity with ID "${id}" not found`);
    }

    return identity;
  }

  /**
   * Fetch Microsoft users from Graph API and insert into identity table
   */
  async importMicrosoftUsers(): Promise<{ inserted: number; errors: any[] }> {
    const client_id = this.configService.get<string>('MS_CLIENT_ID');
    const client_secret = this.configService.get<string>('MS_CLIENT_SECRET');
    const tenant_id = this.configService.get<string>('MS_TENANT_ID');
    const tokenUrl = `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/token`;
    const tokenBody = new URLSearchParams();
    tokenBody.append('client_id', client_id || '');
    tokenBody.append('scope', 'https://graph.microsoft.com/.default');
    tokenBody.append('client_secret', client_secret || '');
    tokenBody.append('grant_type', 'client_credentials');

    // Get access token
    const tokenResp = await axios.post(tokenUrl, tokenBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const access_token = tokenResp.data.access_token;

    // Call Microsoft Graph users API
    const usersResp = await axios.get("https://graph.microsoft.com/v1.0/users?$top=150&$filter=userType eq 'Member'", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const users = usersResp.data.value || [];

    // Map users to Identity entity fields
    const identities: Partial<Identity>[] = users.map((user: any) => ({
      externalId: user.id,
      keycloakId: null,
      email: user.mail || user.userPrincipalName,
      name: user.displayName,
      department: user.department || null,
      jobTitle: user.jobTitle || null,
      preferredUsername: user.userPrincipalName || null,
      isActive: true,
      status: 'active',
      role: 'USER',
    }));

    // Insert, skipping duplicates by unique constraint
    const errors: { email: string | undefined; error: any }[] = [];
    let inserted = 0;
    for (const identity of identities) {
      try {
        await this.identityRepository.save(this.identityRepository.create(identity));
        inserted++;
      } catch (err) {
        errors.push({ email: identity.email, error: err.message });
      }
    }
    return { inserted, errors };
  }
}
