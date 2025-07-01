import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import envConfig from './config/env.config';
import { DocumentModule } from './modules/document/document.module';
import { databaseConfig } from '@config/database.config';
import { HealthModule } from '@modules/health/health.module';
import { DivisionModule } from './modules/division/division.module';
import { CompanyModule } from './modules/company/company.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MongoDBModule } from './modules/mongodb/mongodb.module';
import { DevModule } from './modules/dev/dev.module';
import { PekerjaanModule } from './modules/pekerjaan-NB/pekerjaan.module';
import { ClientModule } from './modules/client/client.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    MongoDBModule,
    AuthModule,
    DocumentModule,
    DivisionModule,
    CompanyModule,
    IdentityModule,
    HealthModule,
    DevModule,
    PekerjaanModule,
    ClientModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
