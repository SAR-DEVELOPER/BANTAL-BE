import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSuratTugas1760926131026 implements MigrationInterface {
    name = 'UpdateSuratTugas1760926131026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ALTER COLUMN "updated_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ALTER COLUMN "created_at" DROP DEFAULT`);
    }

}
