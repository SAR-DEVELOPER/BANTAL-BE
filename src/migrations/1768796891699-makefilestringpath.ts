import { MigrationInterface, QueryRunner } from "typeorm";

export class Makefilestringpath1768796891699 implements MigrationInterface {
    name = 'Makefilestringpath1768796891699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "tax_invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "tax_invoice_file" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "invoice_file" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "invoice_file" uuid`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "tax_invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "tax_invoice_file" uuid`);
    }

}
