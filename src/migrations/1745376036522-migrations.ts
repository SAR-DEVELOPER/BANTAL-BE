import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1745376036522 implements MigrationInterface {
    name = 'Migrations1745376036522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_schema"."surat_perjanjian_kerja" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version_number" integer NOT NULL, "is_latest" boolean NOT NULL DEFAULT true, "uploaded_by" uuid NOT NULL, "client_id" uuid NOT NULL, "document_description" text NOT NULL, "start_date" date NOT NULL, "end_date" date, "project_fee" numeric(19,4) NOT NULL, "payment_installment" integer NOT NULL, "master_document_list_id" uuid, CONSTRAINT "PK_b8c5e1c8aa3d7bad034095f294e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_schema"."surat_penawaran" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version_number" integer NOT NULL, "is_latest" boolean NOT NULL DEFAULT true, "uploaded_by" uuid NOT NULL, "client_id" uuid NOT NULL, "document_description" text NOT NULL, "offered_service" text NOT NULL, "master_document_list_id" uuid, "person_in_charge" uuid, CONSTRAINT "REL_5d773b2cd49d071c67d11c2bf3" UNIQUE ("person_in_charge"), CONSTRAINT "PK_4173a0ba7e5a1edc8705132ee4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."identity_role_enum" AS ENUM('ADMIN', 'USER', 'MANAGER')`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "role" "public"."identity_role_enum" NOT NULL DEFAULT 'USER'`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "document_external_number" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "UQ_7db529bde7431683016943c4fac" UNIQUE ("document_external_number")`);
        await queryRunner.query(`CREATE TYPE "document_schema"."master_document_list_document_status_enum" AS ENUM('DRAFT', 'PENDING', 'SIGNED', 'ACTIVE', 'ARCHIVED', 'EXPIRED', 'CANCELLED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "document_status" "document_schema"."master_document_list_document_status_enum" NOT NULL DEFAULT 'DRAFT'`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "FK_74012df3684de4e2e06ca3e8697" FOREIGN KEY ("created_by") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD CONSTRAINT "FK_893e864b8eb64404bc388ad4e09" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_06cf71a3892c3b1721980fb7123" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32" FOREIGN KEY ("person_in_charge") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_06cf71a3892c3b1721980fb7123"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP CONSTRAINT "FK_893e864b8eb64404bc388ad4e09"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "FK_74012df3684de4e2e06ca3e8697"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "created_by" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "document_status"`);
        await queryRunner.query(`DROP TYPE "document_schema"."master_document_list_document_status_enum"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "UQ_7db529bde7431683016943c4fac"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "document_external_number"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."identity_role_enum"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "is_active"`);
        await queryRunner.query(`DROP TABLE "document_schema"."surat_penawaran"`);
        await queryRunner.query(`DROP TABLE "document_schema"."surat_perjanjian_kerja"`);
    }

}
