import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './core/entities/identity.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Identity
    ]),
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
