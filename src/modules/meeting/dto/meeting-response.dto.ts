import { MeetingStatus } from '../entities/meeting.entity';

export class ParticipantResponseDto {
  id: string;
  participantId: string;
  participant?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export class MeetingResponseDto {
  id: string;
  meetingTitle: string;
  timeStart: Date;
  timeEnd: Date;
  hostClaimKey: string | null;
  status: MeetingStatus;
  startUrl: string | null;
  joinUrl: string | null;
  password: string | null;
  requestedById: string | null;
  requestedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  zoomId: string | null;
  hostEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: ParticipantResponseDto[];
}

