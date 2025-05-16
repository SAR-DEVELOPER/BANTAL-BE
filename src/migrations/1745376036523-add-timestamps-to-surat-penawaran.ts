import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToSuratPenawaran1745376036523 implements MigrationInterface {
    name = 'AddTimestampsToSuratPenawaran1745376036523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document_schema"."surat_penawaran" 
            ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document_schema"."surat_penawaran" 
            DROP COLUMN "created_at",
            DROP COLUMN "updated_at"
        `);
    }
} 