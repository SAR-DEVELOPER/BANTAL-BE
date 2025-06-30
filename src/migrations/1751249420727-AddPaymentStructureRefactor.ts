import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentStructureRefactor1751249420727 implements MigrationInterface {
    name = 'AddPaymentStructureRefactor1751249420727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_installment_trigger_type_enum" AS ENUM('milestone', 'event', 'date', 'manual')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_installment_status_enum" AS ENUM('pending', 'due', 'requested', 'paid')`);
        await queryRunner.query(`CREATE TABLE "payment_installment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pekerjaan_id" uuid NOT NULL, "installment_number" integer NOT NULL, "amount" numeric(19,4) NOT NULL, "percentage" numeric(5,2) NOT NULL, "trigger_type" "public"."payment_installment_trigger_type_enum" NOT NULL, "trigger_value" character varying, "project_milestone_id" uuid, "description" text NOT NULL, "status" "public"."payment_installment_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "due_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4e16bfde5aa5b8c316ca7425d9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "payment_structure"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "project_fee" numeric(19,4)`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "currency" character varying(3) NOT NULL DEFAULT 'IDR'`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "bank_name" character varying`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "account_number" character varying`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "account_name" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ADD CONSTRAINT "FK_2c64c375dd052c8bbf181f5f7a4" FOREIGN KEY ("pekerjaan_id") REFERENCES "pekerjaan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ADD CONSTRAINT "FK_a2e51691503614ea53392ba48b8" FOREIGN KEY ("project_milestone_id") REFERENCES "project_milestone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_installment" DROP CONSTRAINT "FK_a2e51691503614ea53392ba48b8"`);
        await queryRunner.query(`ALTER TABLE "payment_installment" DROP CONSTRAINT "FK_2c64c375dd052c8bbf181f5f7a4"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "account_name"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "account_number"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "bank_name"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "project_fee"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "payment_structure" jsonb NOT NULL`);
        await queryRunner.query(`DROP TABLE "payment_installment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_installment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_installment_trigger_type_enum"`);
    }

}
