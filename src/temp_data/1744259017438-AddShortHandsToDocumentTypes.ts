import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744259017438 implements MigrationInterface {
    name = 'Migrations1744259017438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."document_type" ADD "shorthand" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_schema"."document_type" ADD CONSTRAINT "UQ_c1f5cc771e2ee40af6153cc29b1" UNIQUE ("shorthand")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."document_type" DROP CONSTRAINT "UQ_c1f5cc771e2ee40af6153cc29b1"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."document_type" DROP COLUMN "shorthand"`);
    }

}
