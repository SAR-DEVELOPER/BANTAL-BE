import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749724972295 implements MigrationInterface {
    name = 'Migrations1749724972295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."project_milestone_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."project_milestone_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TABLE "project_milestone" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pekerjaan_id" uuid NOT NULL, "milestone_name" character varying NOT NULL, "milestone_description" text, "due_date" date, "status" "public"."project_milestone_status_enum" NOT NULL DEFAULT 'pending', "completion_percentage" integer NOT NULL DEFAULT '0', "priority" "public"."project_milestone_priority_enum" NOT NULL DEFAULT 'medium', "order_index" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7a9da5fbeade8826432de525d1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "work_milestone"`);
        await queryRunner.query(`ALTER TABLE "project_milestone" ADD CONSTRAINT "FK_3382ecc9bf33e02b1c7ec2f2cf1" FOREIGN KEY ("pekerjaan_id") REFERENCES "pekerjaan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_milestone" DROP CONSTRAINT "FK_3382ecc9bf33e02b1c7ec2f2cf1"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "work_milestone" jsonb NOT NULL`);
        await queryRunner.query(`DROP TABLE "project_milestone"`);
        await queryRunner.query(`DROP TYPE "public"."project_milestone_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_milestone_status_enum"`);
    }

}
