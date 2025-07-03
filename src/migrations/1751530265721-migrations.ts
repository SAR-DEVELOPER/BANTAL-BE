import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751530265721 implements MigrationInterface {
    name = 'Migrations1751530265721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_client_list" ADD "isWapu" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD "isIncludeVAT" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP COLUMN "isIncludeVAT"`);
        await queryRunner.query(`ALTER TABLE "master_client_list" DROP COLUMN "isWapu"`);
    }

}
