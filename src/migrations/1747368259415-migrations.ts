import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747368259415 implements MigrationInterface {
    name = 'Migrations1747368259415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_06cf71a3892c3b1721980fb7123"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ALTER COLUMN "master_document_list_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP CONSTRAINT "FK_893e864b8eb64404bc388ad4e09"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ALTER COLUMN "master_document_list_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_06cf71a3892c3b1721980fb7123" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD CONSTRAINT "FK_893e864b8eb64404bc388ad4e09" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP CONSTRAINT "FK_893e864b8eb64404bc388ad4e09"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_06cf71a3892c3b1721980fb7123"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ALTER COLUMN "master_document_list_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" ADD CONSTRAINT "FK_893e864b8eb64404bc388ad4e09" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ALTER COLUMN "master_document_list_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_06cf71a3892c3b1721980fb7123" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_perjanjian_kerja" DROP COLUMN "created_at"`);
    }

}
