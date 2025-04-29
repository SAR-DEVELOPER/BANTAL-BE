import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1745310944287 implements MigrationInterface {
    name = 'Migrations1745310944287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "master_division_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "division_code" character varying NOT NULL, "division_name" character varying NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0787a4d25369dcdaef1b749b567" UNIQUE ("division_code"), CONSTRAINT "UQ_57e6bba2a8a2b7410b6f1e5b96d" UNIQUE ("division_name"), CONSTRAINT "PK_1b5becd8ef33e24807802b31002" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "master_company_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_code" character varying NOT NULL, "company_name" character varying NOT NULL, "address" text, "phone_number" character varying, "email" character varying, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7059cfb6bfc547f32c437bc5a36" UNIQUE ("company_code"), CONSTRAINT "UQ_d61802732f1ba893d6b3b50a1e5" UNIQUE ("company_name"), CONSTRAINT "PK_7bb373ace3ac9398b162b5afec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "keycloak_id" uuid NOT NULL, "email" character varying(255), "name" character varying(255), "preferred_username" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d12ecd5a215a1f5529660e4717" UNIQUE ("keycloak_id"), CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2d12ecd5a215a1f5529660e471" ON "identity" ("keycloak_id") `);
        await queryRunner.query(`CREATE TABLE "document_schema"."document_type" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "shorthand" character varying NOT NULL, CONSTRAINT "UQ_816f7c1492a755e45583c1d2d69" UNIQUE ("type_name"), CONSTRAINT "UQ_c1f5cc771e2ee40af6153cc29b1" UNIQUE ("shorthand"), CONSTRAINT "PK_2e1aa55eac1947ddf3221506edb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_schema"."master_document_list" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_number" character varying NOT NULL, "document_name" character varying NOT NULL, "document_legal_date" character varying NOT NULL, "created_by" character varying NOT NULL, "index_number" integer NOT NULL, "document_type_id" integer, "master_division_list_id" uuid, "master_company_list_id" uuid, CONSTRAINT "UQ_a72bcfd1857d622a20208d75f1c" UNIQUE ("document_number"), CONSTRAINT "PK_2eac646c00fd6da6dc5b8c90b56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "FK_382432e36c657489e55a029dba9" FOREIGN KEY ("document_type_id") REFERENCES "document_schema"."document_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "FK_b97ac12d956e89e50f649b98c44" FOREIGN KEY ("master_division_list_id") REFERENCES "master_division_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" ADD CONSTRAINT "FK_50b6d79f499f9d51354fc5a016e" FOREIGN KEY ("master_company_list_id") REFERENCES "master_company_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "FK_50b6d79f499f9d51354fc5a016e"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "FK_b97ac12d956e89e50f649b98c44"`);
        await queryRunner.query(`ALTER TABLE "document_schema"."master_document_list" DROP CONSTRAINT "FK_382432e36c657489e55a029dba9"`);
        await queryRunner.query(`DROP TABLE "document_schema"."master_document_list"`);
        await queryRunner.query(`DROP TABLE "document_schema"."document_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d12ecd5a215a1f5529660e471"`);
        await queryRunner.query(`DROP TABLE "identity"`);
        await queryRunner.query(`DROP TABLE "master_company_list"`);
        await queryRunner.query(`DROP TABLE "master_division_list"`);
    }

}
