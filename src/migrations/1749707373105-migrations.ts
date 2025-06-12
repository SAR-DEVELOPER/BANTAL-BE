import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749707373105 implements MigrationInterface {
    name = 'Migrations1749707373105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "project_description" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "project_description"`);
    }

}
