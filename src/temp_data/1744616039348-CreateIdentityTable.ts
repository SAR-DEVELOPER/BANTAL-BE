import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIdentityTable1744616039348 implements MigrationInterface {
    name = 'CreateIdentityTable1744616039348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "keycloak_id" uuid NOT NULL, "email" character varying(255), "name" character varying(255), "preferred_username" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717" UNIQUE ("keycloak_id"), CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2d12ecd5a215a1f5529660e471" ON "identity" ("keycloak_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2d12ecd5a215a1f5529660e471"`);
        await queryRunner.query(`DROP TABLE "identity"`);
    }

}
