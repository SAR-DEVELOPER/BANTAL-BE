import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationsAddSuratTagihanNonBulananDocumentType1751362997869 implements MigrationInterface {
    name = 'MigrationsAddSuratTagihanNonBulananDocumentType1751362997869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_schema"."surat_tagihan_non_bulanan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "master_document_list_id" uuid NOT NULL, "version_number" integer NOT NULL, "is_latest" boolean NOT NULL DEFAULT true, "uploaded_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" uuid NOT NULL, "document_description" text NOT NULL, CONSTRAINT "PK_1d2e0dc0ee36a9a6098358f90df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" ADD CONSTRAINT "FK_5286ff63340639a92127d771251" FOREIGN KEY ("master_document_list_id") REFERENCES "document_schema"."master_document_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_tagihan_non_bulanan" DROP CONSTRAINT "FK_5286ff63340639a92127d771251"`);
        await queryRunner.query(`DROP TABLE "document_schema"."surat_tagihan_non_bulanan"`);
    }

}
