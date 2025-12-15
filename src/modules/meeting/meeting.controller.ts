import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';
import { Meeting } from './entities/meeting.entity';
import { MeetingAccount } from './entities/meeting-account.entity';
import { UpdateHostKeyDto } from './dto/update-host-key.dto';
import { HostKey } from './entities/host-key.entity';
import { SyncForwardDto } from './dto/sync-forward.dto';

@Controller('meeting')
export class MeetingController {
  private readonly logger = new Logger(MeetingController.name);

  constructor(private readonly meetingService: MeetingService) { }

  /**
   * health check for zoom
   * GET /meeting/health-check/zoom
   */
  @Get('health-check/zoom')
  healthCheckZoom(): string {
    return 'Zoom is healthy';
  }

  /**
   * Create a new meeting
   * POST /meeting
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingService.create(createMeetingDto);
  }

  /**
   * Get all meetings grouped by host_id
   * GET /meeting
   */
  @Get()
  findAll(): Promise<Array<{ id: string | null; meetings: Meeting[] }>> {
    return this.meetingService.findAll();
  }

  /**
   * Get all meeting accounts
   * GET /meeting/accounts
   */
  @Get('accounts')
  getAccounts(): Promise<MeetingAccount[]> {
    return this.meetingService.getAccounts();
  }


  /**
   * Update a host key
   * PUT /meeting/host-key
   */
  @Put('host-key')
  updateHostKey(@Body() updateHostKeyDto: UpdateHostKeyDto): Promise<HostKey> {
    return this.meetingService.updateHostKey(updateHostKeyDto);
  }

  /**
   * Get a host key
   * GET /meeting/host-key
   */
  @Get('host-key')
  getHostKey(): Promise<HostKey> {
    return this.meetingService.getHostKey();
  }

  @Post('scheduler/sync-forward')
  async syncForward(@Body() body: any): Promise<void> {
    this.logger.debug('Received sync-forward request body:', JSON.stringify(body, null, 2));

    // Validate the body structure
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    if (!body.accountId && !body.accountID) {
      throw new BadRequestException('accountId is required');
    }

    if (!body.meetings || !Array.isArray(body.meetings)) {
      throw new BadRequestException('meetings must be an array');
    }

    // Normalize accountId field
    const syncForwardDto: SyncForwardDto = {
      accountId: body.accountId || body.accountID,
      meetings: body.meetings,
    };

    this.logger.debug(`Processing ${syncForwardDto.meetings.length} meetings for account: ${syncForwardDto.accountId}`);

    return this.meetingService.syncForward(syncForwardDto);
  }

  /**
   * Update a meeting
   * PUT /meeting/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    return this.meetingService.update(id, updateMeetingDto);
  }


  /**
   * Get a single meeting by ID
   * GET /meeting/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Meeting> {
    return this.meetingService.findOne(id);
  }

  /**
   * Update meeting participants
   * PUT /meeting/:id/participants
   */
  @Put(':id/participants')
  updateParticipants(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateParticipantsDto: UpdateParticipantsDto,
  ): Promise<Meeting> {
    return this.meetingService.updateParticipants(id, updateParticipantsDto);
  }

  /**
   * Cancel a meeting
   * PUT /meeting/:id/cancel
   */
  @Put(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<Meeting> {
    return this.meetingService.cancel(id);
  }

}

