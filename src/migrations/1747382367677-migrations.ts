import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747382367677 implements MigrationInterface {
    name = 'Migrations1747382367677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pekerjaan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_name" character varying NOT NULL, "spk_id" character varying NOT NULL, "team_member_structure" jsonb NOT NULL, "work_milestone" jsonb NOT NULL, "payment_structure" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e051ee17390f3fb8d544e9f1e8a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pekerjaan"`);
    }

}
