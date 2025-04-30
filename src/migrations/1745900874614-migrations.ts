import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1745900874614 implements MigrationInterface {
    name = 'Migrations1745900874614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "mongo_document_id"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "mongo_document_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "mongo_document_id"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "mongo_document_id" uuid`);
    }

}
