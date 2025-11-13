import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMeetingEntity1762849667569 implements MigrationInterface {
    name = 'AddMeetingEntity1762849667569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "meeting_participant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meeting_id" uuid NOT NULL, "participant_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a777ab540618277d478d76ce891" UNIQUE ("meeting_id", "participant_id"), CONSTRAINT "PK_076322be51eef11585f17a45c66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."meeting_status_enum" AS ENUM('scheduled', 'live', 'finished', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "meeting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meeting_title" character varying(500) NOT NULL, "time_start" TIMESTAMP NOT NULL, "time_end" TIMESTAMP NOT NULL, "host_claim_key" character varying(255), "status" "public"."meeting_status_enum" NOT NULL DEFAULT 'scheduled', "start_url" text, "join_url" text, "password" character varying(255), "requested_by" uuid, "zoom_id" character varying(255), "host_email" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dccaf9e4c0e39067d82ccc7bb83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "FK_edff9f9b6ac4c6d5a813f008885" FOREIGN KEY ("meeting_id") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" ADD CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25" FOREIGN KEY ("participant_id") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meeting" ADD CONSTRAINT "FK_b20886932569efc2d1af30cfda4" FOREIGN KEY ("requested_by") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meeting" DROP CONSTRAINT "FK_b20886932569efc2d1af30cfda4"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "FK_abdb1b55d7eb512061f3b238c25"`);
        await queryRunner.query(`ALTER TABLE "meeting_participant" DROP CONSTRAINT "FK_edff9f9b6ac4c6d5a813f008885"`);
        await queryRunner.query(`DROP TABLE "meeting"`);
        await queryRunner.query(`DROP TYPE "public"."meeting_status_enum"`);
        await queryRunner.query(`DROP TABLE "meeting_participant"`);
    }

}
