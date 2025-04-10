import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentSchema1739175751241 implements MigrationInterface {
  name = 'CreateDocumentSchema1739175751240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "document_schema"`);
    await queryRunner.query(
      `CREATE TABLE "document_schema"."document_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "type_name" character varying NOT NULL, CONSTRAINT "UQ_816f7c1492a755e45583c1d2d69" UNIQUE ("type_name"), CONSTRAINT "PK_2e1aa55eac1947ddf3221506edb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_schema"."master_document_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "document_number" character varying NOT NULL, "document_name" character varying NOT NULL, "description" text, "type_id" uuid, CONSTRAINT "UQ_a72bcfd1857d622a20208d75f1c" UNIQUE ("document_number"), CONSTRAINT "PK_2eac646c00fd6da6dc5b8c90b56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_schema"."document_info_status_enum" AS ENUM('DRAFT', 'PENDING', 'SIGNED', 'ACTIVE', 'ARCHIVED', 'EXPIRED', 'CANCELLED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_schema"."document_info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "signed_by" uuid, "signed_at" TIMESTAMP, "recipient_name" character varying NOT NULL, "recipient_address" text NOT NULL, "status" "document_schema"."document_info_status_enum" NOT NULL DEFAULT 'DRAFT', "document_id" uuid, CONSTRAINT "REL_fac5b1e01e86761b790f4c9359" UNIQUE ("document_id"), CONSTRAINT "PK_a5683dcd9056f2896776e6dff8d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "FK_9f1f299ca4fa2e23792b66a89fa" FOREIGN KEY ("type_id") REFERENCES "document_schema"."document_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_schema"."document_info" ADD CONSTRAINT "FK_fac5b1e01e86761b790f4c93599" FOREIGN KEY ("document_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_schema"."document_info" DROP CONSTRAINT "FK_fac5b1e01e86761b790f4c93599"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "FK_9f1f299ca4fa2e23792b66a89fa"`,
    );
    await queryRunner.query(`DROP TABLE "document_schema"."document_info"`);
    await queryRunner.query(
      `DROP TYPE "document_schema"."document_info_status_enum"`,
    );
    await queryRunner.query(
      `DROP TABLE "document_schema"."master_document_list"`,
    );
    await queryRunner.query(`DROP TABLE "document_schema"."document_type"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "document_schema" CASCADE`);
  }
}
