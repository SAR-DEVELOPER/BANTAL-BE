import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1745901293583 implements MigrationInterface {
    name = 'Migrations1745901293583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "UQ_7db529bde7431683016943c4fac"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "UQ_7db529bde7431683016943c4fac" UNIQUE ("document_external_number")`);
    }

}
