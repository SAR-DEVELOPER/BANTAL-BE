import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMeetingEntity1762919338063 implements MigrationInterface {
    name = 'UpdateMeetingEntity1762919338063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meeting" RENAME COLUMN "host_email" TO "host_id"`);
        await queryRunner.query(`ALTER TABLE "meeting" DROP COLUMN "host_id"`);
        await queryRunner.query(`ALTER TABLE "meeting" ADD "host_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meeting" DROP COLUMN "host_id"`);
        await queryRunner.query(`ALTER TABLE "meeting" ADD "host_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "meeting" RENAME COLUMN "host_id" TO "host_email"`);
    }

}
