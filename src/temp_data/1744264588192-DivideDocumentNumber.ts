import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744264588192 implements MigrationInterface {
    name = 'Migrations1744264588192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "document_issuer_division" character varying`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "document_issuer_company" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "document-description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "document-description"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "document_issuer_company"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "document_issuer_division"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "description" text`);
    }

}
