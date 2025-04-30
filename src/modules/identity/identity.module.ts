import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './core/entities/identity.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Identity
    ]),
    ConfigModule,
    AuthModule,
  ],
  providers: [
    IdentityService,
  ],
  controllers: [
    IdentityController,
  ],
  exports: [
    IdentityService,
  ],
})
export class IdentityModule {}
