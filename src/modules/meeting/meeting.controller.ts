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
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';
import { Meeting } from './entities/meeting.entity';
import { MeetingAccount } from './entities/meeting-account.entity';
import { UpdateHostKeyDto } from './dto/update-host-key.dto';
import { HostKey } from './entities/host-key.entity';

@Controller('meeting')
export class MeetingController {
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

