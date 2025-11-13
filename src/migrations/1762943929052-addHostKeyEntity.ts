import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHostKeyEntity1762943929052 implements MigrationInterface {
    name = 'AddHostKeyEntity1762943929052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "host_key" ("id" SERIAL NOT NULL, "host_key" character varying(255) NOT NULL, "set_time" TIMESTAMP NOT NULL, "expired_at" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b7530939af3bdded0ab17e28414" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "host_key"`);
    }

}
