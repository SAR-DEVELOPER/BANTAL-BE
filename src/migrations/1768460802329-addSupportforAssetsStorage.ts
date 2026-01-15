import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupportforAssetsStorage1768460802329 implements MigrationInterface {
    name = 'AddSupportforAssetsStorage1768460802329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "office" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "office_code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "address" text, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_200185316ba169fda17e3b6ba00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid NOT NULL, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "group_code" character varying(255) NOT NULL, "group_name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f4f60389475ff22f509c905e50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type_code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "asset_group_id" uuid NOT NULL, CONSTRAINT "PK_9b5ee2748943131ed9d9831e8c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset_code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "updated_by" uuid NOT NULL, "company_id" uuid NOT NULL, "asset_group_id" uuid NOT NULL, "asset_type_id" uuid NOT NULL, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_10e4261a52a8105da8737fdb595" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_type" ADD CONSTRAINT "FK_f6af0802e2b4eeb9a817eec363b" FOREIGN KEY ("asset_group_id") REFERENCES "asset_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_e09a05ea1e78a12865a82b2dc04" FOREIGN KEY ("company_id") REFERENCES "master_company_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_cda0b3418c19a625c2f38c91188" FOREIGN KEY ("asset_group_id") REFERENCES "asset_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_ac8cf0356d842c3d88fbbba4e72" FOREIGN KEY ("asset_type_id") REFERENCES "asset_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_ac8cf0356d842c3d88fbbba4e72"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_cda0b3418c19a625c2f38c91188"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_e09a05ea1e78a12865a82b2dc04"`);
        await queryRunner.query(`ALTER TABLE "asset_type" DROP CONSTRAINT "FK_f6af0802e2b4eeb9a817eec363b"`);
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_10e4261a52a8105da8737fdb595"`);
        await queryRunner.query(`DROP TABLE "asset"`);
        await queryRunner.query(`DROP TABLE "asset_type"`);
        await queryRunner.query(`DROP TABLE "asset_group"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "office"`);
    }

}
