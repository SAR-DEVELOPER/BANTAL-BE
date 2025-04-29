import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1745896621385 implements MigrationInterface {
    name = 'Migrations1745896621385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD "mongo_document_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP COLUMN "mongo_document_id"`);
    }

}
