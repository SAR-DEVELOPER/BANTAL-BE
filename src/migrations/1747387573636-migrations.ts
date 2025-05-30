import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747387573636 implements MigrationInterface {
    name = 'Migrations1747387573636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "REL_5d773b2cd49d071c67d11c2bf3"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32" FOREIGN KEY ("person_in_charge") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" DROP CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "REL_5d773b2cd49d071c67d11c2bf3" UNIQUE ("person_in_charge")`);
        await queryRunner.query(`ALTER TABLE "document_schema"."surat_penawaran" ADD CONSTRAINT "FK_5d773b2cd49d071c67d11c2bf32" FOREIGN KEY ("person_in_charge") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
