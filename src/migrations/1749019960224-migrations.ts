import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749019960224 implements MigrationInterface {
    name = 'Migrations1749019960224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pekerjaan_creation_status_enum" AS ENUM('created', 'in_progress', 'completed')`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "creation_status" "public"."pekerjaan_creation_status_enum" NOT NULL DEFAULT 'created'`);
        await queryRunner.query(`CREATE TYPE "public"."pekerjaan_progress_status_enum" AS ENUM('on_track', 'at_risk', 'delayed', 'issue')`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" ADD "progress_status" "public"."pekerjaan_progress_status_enum" NOT NULL DEFAULT 'on_track'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "progress_status"`);
        await queryRunner.query(`DROP TYPE "public"."pekerjaan_progress_status_enum"`);
        await queryRunner.query(`ALTER TABLE "pekerjaan" DROP COLUMN "creation_status"`);
        await queryRunner.query(`DROP TYPE "public"."pekerjaan_creation_status_enum"`);
    }

}
