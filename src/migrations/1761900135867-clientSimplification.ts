import { MigrationInterface, QueryRunner } from "typeorm";

export class ClientSimplification1761900135867 implements MigrationInterface {
    name = 'ClientSimplification1761900135867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_phone" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_client_list" ALTER COLUMN "contact_name" SET NOT NULL`);
    }

}
