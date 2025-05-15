import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747275684574 implements MigrationInterface {
    name = 'Migrations1747275684574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "identity" ADD "external_id" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "identity" ADD CONSTRAINT "UQ_44deca8dc7cf45dcc6731a7d194" UNIQUE ("external_id")`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "department" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "job_title" character varying(255)`);
        await queryRunner.query(`CREATE TYPE "public"."identity_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "status" "public"."identity_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d12ecd5a215a1f5529660e471"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "keycloak_id"`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "keycloak_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "identity" ADD CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717" UNIQUE ("keycloak_id")`);
        await queryRunner.query(`ALTER TABLE "identity" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "identity" ADD CONSTRAINT "UQ_0d9005670fa2ee7dcc48842f64d" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "identity" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_44deca8dc7cf45dcc6731a7d19" ON "identity" ("external_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2d12ecd5a215a1f5529660e471" ON "identity" ("keycloak_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2d12ecd5a215a1f5529660e471"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44deca8dc7cf45dcc6731a7d19"`);
        await queryRunner.query(`ALTER TABLE "identity" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "identity" DROP CONSTRAINT "UQ_0d9005670fa2ee7dcc48842f64d"`);
        await queryRunner.query(`ALTER TABLE "identity" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "identity" DROP CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "keycloak_id"`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "keycloak_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "identity" ADD CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717" UNIQUE ("keycloak_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_2d12ecd5a215a1f5529660e471" ON "identity" ("keycloak_id") `);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."identity_status_enum"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "job_title"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP CONSTRAINT "UQ_44deca8dc7cf45dcc6731a7d194"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "external_id"`);
    }

}
