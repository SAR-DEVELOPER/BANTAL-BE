import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMasterDcoumentIdToSuratTugas1761284957069 implements MigrationInterface {
    name = 'AddMasterDcoumentIdToSuratTugas1761284957069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ADD "master_document_list_id" uuid`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" ADD CONSTRAINT "FK_ec05272b067c6240a9c9fdfb063" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" DROP CONSTRAINT "FK_ec05272b067c6240a9c9fdfb063"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tugas" DROP COLUMN "master_document_list_id"`);
    }

}
