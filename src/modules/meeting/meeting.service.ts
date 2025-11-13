import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Meeting, MeetingStatus } from './entities/meeting.entity';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';
import { MeetingAccount } from './entities/meeting-account.entity';
import { UpdateHostKeyDto } from './dto/update-host-key.dto';
import { HostKey } from './entities/host-key.entity';

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    @InjectRepository(MeetingAccount)
    private meetingAccountRepository: Repository<MeetingAccount>,
    @InjectRepository(HostKey)
    private hostKeyRepository: Repository<HostKey>,
  ) { }

  /**
   * Create a new meeting
   */
  async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    this.logger.debug(`Creating new meeting: ${createMeetingDto.meetingTitle}`);
    this.logger.debug(`Time start: ${createMeetingDto.timeStart}`);
    this.logger.debug(`Time end: ${createMeetingDto.timeEnd}`);
    this.logger.debug(`Requested by: ${createMeetingDto.requestedById}`);
    this.logger.debug(`Internal attendants: ${createMeetingDto.internalAttendants}`);
    this.logger.debug(`Email attendants: ${createMeetingDto.emailAttendants}`);
    this.logger.debug(`Host id: ${createMeetingDto.hostId}`);

    // Call n8n to create a new meeting
    // Calculate duration in minutes from date strings
    const startDate = new Date(createMeetingDto.timeStart);
    const endDate = new Date(createMeetingDto.timeEnd);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    // Use Docker service name 'n8n' when running in Docker, or 'localhost' for local development
    // Can be overridden via N8N_URL environment variable (e.g., N8N_URL=http://localhost:5678)
    const n8nHost = process.env.N8N_URL || 'http://n8n:5678';
    const n8nWebhookPath = '/webhook/d24399a8-682b-4b19-9322-4e8d8e29402d';
    const n8nUrl = `${n8nHost}${n8nWebhookPath}`;

    // Prepare Basic Auth header if credentials are provided
    const n8nUsername = "api-bantal-backend";
    const n8nPassword = "JalanCipunagara25!";
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get host email from Zoom account (MeetingAccount) if accountId is provided
    let hostEmail: string | null = null;
    let accountId: string | null = null;
    if (createMeetingDto.hostId) {
      const zoomAccount = await this.meetingAccountRepository.findOne({
        where: { id: createMeetingDto.hostId },
      });
      if (!zoomAccount) {
        throw new NotFoundException(`Meeting account with id ${createMeetingDto.accountId} not found`);
      }
      hostEmail = zoomAccount.accountEmail;
      accountId = zoomAccount.id;
    }

    if (n8nUsername && n8nPassword) {
      // Create Basic Auth header: base64(username:password)
      const credentials = Buffer.from(`${n8nUsername}:${n8nPassword}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
      this.logger.debug(`Calling n8n webhook with Basic Auth: ${n8nUrl}`);
    } else {
      this.logger.debug(`Calling n8n webhook: ${n8nUrl}`);
    }

    let n8nResponse: Response;
    let n8nResult: any = {};
    try {
      n8nResponse = await fetch(n8nUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          meetingTitle: createMeetingDto.meetingTitle,
          timeStart: createMeetingDto.timeStart,
          duration: durationMinutes,
          accountId: accountId || undefined,
          hostEmail: hostEmail || undefined,
        }),
      });

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text().catch(() => 'Unknown error');
        this.logger.error(`n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText} - ${errorText}`);
        throw new BadRequestException(
          `Failed to create meeting via n8n webhook: ${n8nResponse.status} ${n8nResponse.statusText}. ${errorText}`
        );
      }

      n8nResult = await n8nResponse.json().catch(() => ({}));
      this.logger.debug(`n8n webhook response: ${JSON.stringify(n8nResult)}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error calling n8n webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException(
        `Failed to connect to n8n webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Create meeting
    const meeting = this.meetingRepository.create({
      meetingTitle: createMeetingDto.meetingTitle,
      timeStart: new Date(createMeetingDto.timeStart),
      timeEnd: new Date(createMeetingDto.timeEnd),
      hostClaimKey: 'abc123',
      startUrl: n8nResult.startUrl || null,
      joinUrl: n8nResult.joinUrl || null,
      password: n8nResult.password || null,
      requestedById: createMeetingDto.requestedById || null,
      zoomId: n8nResult.zoomId || null,
      hostId: createMeetingDto.hostId || null,
      internalAttendantIds: createMeetingDto.internalAttendants || [],
      emailAttendants: createMeetingDto.emailAttendants || [],
      status: MeetingStatus.SCHEDULED,
    });

    return await this.meetingRepository.save(meeting);
  }

  /**
   * Get all meetings grouped by host_id
   */
  async findAll(): Promise<Array<{ id: string | null; meetings: Meeting[] }>> {
    const meetings = await this.meetingRepository.find({
      relations: ['requestedBy'],
      order: { timeStart: 'ASC' },
    });

    // Group meetings by hostId
    const groupedMeetings = new Map<string | null, Meeting[]>();

    for (const meeting of meetings) {
      const hostId = meeting.hostId || null;
      if (!groupedMeetings.has(hostId)) {
        groupedMeetings.set(hostId, []);
      }
      groupedMeetings.get(hostId)!.push(meeting);
    }

    // Convert Map to array format
    return Array.from(groupedMeetings.entries()).map(([id, meetings]) => ({
      id,
      meetings,
    }));
  }

  /**
   * Get a single meeting by ID
   */
  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: ['requestedBy'],
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${id} not found`);
    }

    return meeting;
  }

  /**
   * Update meeting participants
   */
  async updateParticipants(
    id: string,
    updateParticipantsDto: UpdateParticipantsDto,
  ): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${id} not found`);
    }

    // Validate internal participants exist if provided
    if (updateParticipantsDto.internalAttendantIds && updateParticipantsDto.internalAttendantIds.length > 0) {
      const participants = await this.identityRepository.find({
        where: { id: In(updateParticipantsDto.internalAttendantIds) },
      });
      if (participants.length !== updateParticipantsDto.internalAttendantIds.length) {
        throw new BadRequestException('One or more internal participant IDs not found');
      }
      meeting.internalAttendantIds = updateParticipantsDto.internalAttendantIds;
    }

    // Update email attendants if provided
    if (updateParticipantsDto.emailAttendants !== undefined) {
      meeting.emailAttendants = updateParticipantsDto.emailAttendants;
    }

    await this.meetingRepository.save(meeting);
    return this.findOne(id);
  }

  /**
   * Cancel a meeting
   */
  async cancel(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${id} not found`);
    }

    if (meeting.status === MeetingStatus.CANCELLED) {
      throw new BadRequestException('Meeting is already cancelled');
    }

    if (meeting.status === MeetingStatus.FINISHED) {
      throw new BadRequestException('Cannot cancel a finished meeting');
    }

    meeting.status = MeetingStatus.CANCELLED;
    await this.meetingRepository.save(meeting);

    return this.findOne(id);
  }

  /**
   * Update a meeting
   */
  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${id} not found`);
    }

    // Validate requestedBy if provided
    if (updateMeetingDto.requestedById) {
      const requester = await this.identityRepository.findOne({
        where: { id: updateMeetingDto.requestedById },
      });
      if (!requester) {
        throw new BadRequestException(
          `Identity with id ${updateMeetingDto.requestedById} not found`,
        );
      }
    }

    // Update fields
    if (updateMeetingDto.meetingTitle !== undefined) {
      meeting.meetingTitle = updateMeetingDto.meetingTitle;
    }
    if (updateMeetingDto.timeStart !== undefined) {
      meeting.timeStart = new Date(updateMeetingDto.timeStart);
    }
    if (updateMeetingDto.timeEnd !== undefined) {
      meeting.timeEnd = new Date(updateMeetingDto.timeEnd);
    }
    if (updateMeetingDto.hostClaimKey !== undefined) {
      meeting.hostClaimKey = updateMeetingDto.hostClaimKey;
    }
    if (updateMeetingDto.status !== undefined) {
      meeting.status = updateMeetingDto.status;
    }
    if (updateMeetingDto.startUrl !== undefined) {
      meeting.startUrl = updateMeetingDto.startUrl;
    }
    if (updateMeetingDto.joinUrl !== undefined) {
      meeting.joinUrl = updateMeetingDto.joinUrl;
    }
    if (updateMeetingDto.password !== undefined) {
      meeting.password = updateMeetingDto.password;
    }
    if (updateMeetingDto.requestedById !== undefined) {
      meeting.requestedById = updateMeetingDto.requestedById;
    }
    if (updateMeetingDto.zoomId !== undefined) {
      meeting.zoomId = updateMeetingDto.zoomId;
    }
    if (updateMeetingDto.hostId !== undefined) {
      meeting.hostId = updateMeetingDto.hostId;
    }

    await this.meetingRepository.save(meeting);

    return this.findOne(id);
  }

  /**
   * Get all meeting accounts
   */
  async getAccounts(): Promise<MeetingAccount[]> {
    console.log('Getting all meeting accounts');
    return this.meetingAccountRepository.find();
  }

  /**
   * Update a host key
   * Invalidates existing active host keys and creates a new one atomically
   */
  async updateHostKey(updateHostKeyDto: UpdateHostKeyDto): Promise<HostKey> {
    const setTime = new Date(updateHostKeyDto.setTime);
    const expiresAt = new Date(updateHostKeyDto.expiresAt);

    // Validate that expiresAt is after setTime
    if (expiresAt <= setTime) {
      throw new BadRequestException('expiresAt must be after setTime');
    }

    // Use a transaction to ensure atomicity
    try {
      return await this.hostKeyRepository.manager.transaction(async (transactionalEntityManager) => {
        // Invalidate all existing active host keys
        await transactionalEntityManager.update(
          HostKey,
          { isActive: true },
          { isActive: false },
        );

        // Create new host key
        const hostKey = transactionalEntityManager.create(HostKey, {
          hostKey: updateHostKeyDto.hostKey,
          setTime,
          expiresAt,
          isActive: true,
        });

        const savedHostKey = await transactionalEntityManager.save(hostKey);
        this.logger.debug(`Host key updated successfully: ${savedHostKey.id}`);
        return savedHostKey;
      });
    } catch (error) {
      this.logger.error(`Failed to update host key: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException(
        `Failed to update host key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get the active host key
   */
  async getHostKey(): Promise<HostKey> {
    const hostKey = await this.hostKeyRepository.findOne({
      where: { isActive: true },
    });

    if (!hostKey) {
      throw new NotFoundException('No active host key found');
    }

    return hostKey;
  }
}

