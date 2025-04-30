import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('keycloak-direct')
export class KeycloakDirectController {
  constructor(private configService: ConfigService) {}

  // The getKeycloakUsers endpoint has been removed
} 