import { MigrationInterface, QueryRunner } from "typeorm";

export class Cahngehistoryidtouuid1769741486088 implements MigrationInterface {
    name = 'Cahngehistoryidtouuid1769741486088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_history" DROP CONSTRAINT "PK_409e5fb8b4b5b0252accb6bc435"`);
        await queryRunner.query(`ALTER TABLE "asset_history" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "asset_history" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "asset_history" ADD CONSTRAINT "PK_409e5fb8b4b5b0252accb6bc435" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_history" DROP CONSTRAINT "PK_409e5fb8b4b5b0252accb6bc435"`);
        await queryRunner.query(`ALTER TABLE "asset_history" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "asset_history" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset_history" ADD CONSTRAINT "PK_409e5fb8b4b5b0252accb6bc435" PRIMARY KEY ("id")`);
    }

}
