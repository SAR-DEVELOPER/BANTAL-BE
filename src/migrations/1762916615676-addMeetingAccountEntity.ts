import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMeetingAccountEntity1762916615676 implements MigrationInterface {
    name = 'AddMeetingAccountEntity1762916615676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "UQ_a777ab540618277d478d76ce891"`);
        await queryRunner.query(`CREATE TABLE "meeting_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_name" character varying(255) NOT NULL, "account_email" character varying(255) NOT NULL, "account_status" character varying(255) NOT NULL, "account_plan_type" character varying(255) NOT NULL, CONSTRAINT "PK_8feecb6c4a74383a898e58ffdd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "meeting" ADD "internal_attendant_ids" uuid array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "meeting" ADD "email_attendants" character varying array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD "email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ALTER COLUMN "participant_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "CHK_266bc1f7f266fe200bafde5917" CHECK (("participant_id" IS NOT NULL AND "email" IS NULL) OR ("participant_id" IS NULL AND "email" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25" FOREIGN KEY ("participant_id") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "CHK_266bc1f7f266fe200bafde5917"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ALTER COLUMN "participant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25" FOREIGN KEY ("participant_id") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "meeting" DROP COLUMN "email_attendants"`);
        await queryRunner.query(`ALTER TABLE "meeting" DROP COLUMN "internal_attendant_ids"`);
        await queryRunner.query(`DROP TABLE "meeting_account"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "UQ_a777ab540618277d478d76ce891" UNIQUE ("meeting_id", "participant_id")`);
    }

}
