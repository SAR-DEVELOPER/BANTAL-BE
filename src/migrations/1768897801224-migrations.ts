import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1768897801224 implements MigrationInterface {
    name = 'Migrations1768897801224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."asset_history_action_enum" AS ENUM('acquisition', 'relocation', 'assignment', 'maintenance', 'depreciation', 'status_change', 'disposal')`);
        await queryRunner.query(`CREATE TABLE "asset_history" ("id" SERIAL NOT NULL, "action" "public"."asset_history_action_enum" NOT NULL, "date" date NOT NULL, "description" text, "payload" jsonb NOT NULL, "documents" jsonb, "notes" text, "approved_by" uuid, "approved_at" TIMESTAMP, "created_by" uuid NOT NULL, "updated_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "asset_id" uuid, CONSTRAINT "PK_409e5fb8b4b5b0252accb6bc435" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f7d1d4d651aa27222f41eeff0e" ON "asset_history" ("asset_id", "date") `);
        await queryRunner.query(`CREATE INDEX "IDX_d392f7b690d12fb4bb6eb24825" ON "asset_history" ("asset_id", "action") `);
        await queryRunner.query(`ALTER TABLE "asset_history" ADD CONSTRAINT "FK_7621be09cced32b245cf6c45230" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_history" DROP CONSTRAINT "FK_7621be09cced32b245cf6c45230"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d392f7b690d12fb4bb6eb24825"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7d1d4d651aa27222f41eeff0e"`);
        await queryRunner.query(`DROP TABLE "asset_history"`);
        await queryRunner.query(`DROP TYPE "public"."asset_history_action_enum"`);
    }

}
