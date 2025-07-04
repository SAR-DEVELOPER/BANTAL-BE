import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751599301893 implements MigrationInterface {
    name = 'Migrations1751599301893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "Nilai Kontrak" numeric(19,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "DPP_nilai_lain" numeric(19,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "PPN_12" numeric(19,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "PPh_23" numeric(19,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "Total_tagihan" numeric(19,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "bank_info" jsonb`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD "SPK_id" uuid NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "SPK_id"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "bank_info"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "Total_tagihan"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "PPh_23"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "PPN_12"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "DPP_nilai_lain"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP COLUMN "Nilai Kontrak"`);
    }

}
