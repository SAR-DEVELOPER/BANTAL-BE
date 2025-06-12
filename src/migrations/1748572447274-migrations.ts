import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1748572447274 implements MigrationInterface {
    name = 'Migrations1748572447274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "client_type" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f838abdcbc6fc58de6db26c1e65" UNIQUE ("name"), CONSTRAINT "PK_a4ec97ac782ed598e0b28e66ccd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."master_client_list_status_enum" AS ENUM('Active', 'blacklist', 'cautious')`);
        await queryRunner.query(`CREATE TABLE "master_client_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "group" character varying(255), "contact_name" character varying(255) NOT NULL, "contact_position" character varying(255), "contact_email" character varying(255) NOT NULL, "contact_phone" character varying(50) NOT NULL, "referral_from" character varying(255), "date_of_first_project" date, "status" "public"."master_client_list_status_enum" NOT NULL DEFAULT 'Active', "priority_number" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type_id" integer NOT NULL, CONSTRAINT "PK_9f3371e686b5dd859bd9ae1db12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "master_client_list" ADD CONSTRAINT "FK_44d68060c4b60e724efa7a06fde" FOREIGN KEY ("type_id") REFERENCES "client_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_client_list" DROP CONSTRAINT "FK_44d68060c4b60e724efa7a06fde"`);
        await queryRunner.query(`DROP TABLE "master_client_list"`);
        await queryRunner.query(`DROP TYPE "public"."master_client_list_status_enum"`);
        await queryRunner.query(`DROP TABLE "client_type"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }

}
