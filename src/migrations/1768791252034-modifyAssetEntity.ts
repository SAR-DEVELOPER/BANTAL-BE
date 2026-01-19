import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyAssetEntity1768791252034 implements MigrationInterface {
    name = 'ModifyAssetEntity1768791252034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" ADD "photo_url" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "acquisition_date" date`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "acquisition_price" numeric(19,4)`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "vat" numeric(19,4)`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "tax_invoice_number" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "tax_invoice_file" uuid`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "invoice_number" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "invoice_file" uuid`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "current_condition" text`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "office_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "room_id" uuid`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "employee_id" uuid`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_17c6d5d81bc78b5077e38d95365" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_79e645d856d6156f9af357e36ab" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_3796ef2c7c0e8e15e0fe38165bf" FOREIGN KEY ("employee_id") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_3796ef2c7c0e8e15e0fe38165bf"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_79e645d856d6156f9af357e36ab"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_17c6d5d81bc78b5077e38d95365"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "employee_id"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "office_id"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "current_condition"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "invoice_number"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "tax_invoice_file"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "tax_invoice_number"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "vat"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "acquisition_price"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "acquisition_date"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "photo_url"`);
    }

}
