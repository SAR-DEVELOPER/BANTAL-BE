
import { MigrationInterface, QueryRunner } from "typeorm";

export class MockDataFullInsert2099999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert into identity
        await queryRunner.query(`
            INSERT INTO "identity" (id, keycloak_id, email, name, preferred_username, created_at, updated_at)
            VALUES 
            (uuid_generate_v4(), uuid_generate_v4(), 'user@example.com', 'John Doe', 'johndoe', now(), now()),
            (uuid_generate_v4(), uuid_generate_v4(), 'user2@example.com', 'Jane Smith', 'janesmith', now(), now()),
            (uuid_generate_v4(), uuid_generate_v4(), 'user3@example.com', 'Alice Johnson', 'alicejohnson', now(), now());
        `);

        // Insert into master_company_list
        await queryRunner.query(`
            INSERT INTO "master_company_list" (id, company_code, company_name, address, phone_number, email, description, is_active, created_by, created_at, updated_at)
            VALUES 
            (uuid_generate_v4(), 'SAR', 'SAR Tax & Management Consultant', '123 Example Street', '1234567890', 'contact@example.com', 'A sample company.', true, 'admin', now(), now()),
            (uuid_generate_v4(), 'JSR', 'Jojo Sunaryo dan Rekan', '456 Business Ave', '0987654321', 'info@abc.com', 'Technology solutions provider', true, 'admin', now(), now()),
            (uuid_generate_v4(), 'SSN', 'Sarana Solusi Nawala', '789 Industrial Park', '5554443333', 'contact@xyz.com', 'Manufacturing company', true, 'admin', now(), now());
        `);

        // Insert into master_division_list
        await queryRunner.query(`
            INSERT INTO "master_division_list" (id, division_code, division_name, description, is_active, created_by, created_at, updated_at)
            VALUES 
            (uuid_generate_v4(), 'MAR', 'Marketing', 'Handles all marketing activities.', true, 'admin', now(), now()),
            (uuid_generate_v4(), 'FIN', 'Finance', 'Handles all Finance activities.', true, 'admin', now(), now()),
            (uuid_generate_v4(), 'HRD', 'Human Resource', 'Handles all Human Resource activities.', true, 'admin', now(), now()),
            (uuid_generate_v4(), 'IT', 'Information Technology', 'Handles all Information Technology activities.', true, 'admin', now(), now());
        `);

        // Insert into document_type
        await queryRunner.query(`
            INSERT INTO document_schema.document_type (created_at, updated_at, is_active, id, type_name, shorthand)
            VALUES
            (now(), now(), true, nextval('document_schema.document_type_id_seq'::regclass), 'Surat Penawaran', 'Pwn'),
            (now(), now(), true, nextval('document_schema.document_type_id_seq'::regclass), 'Surat Perjanjian Kerja', 'SPK');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "document_schema"."surat_perjanjian_kerja";`);
        await queryRunner.query(`DELETE FROM "document_schema"."surat_penawaran";`);
        await queryRunner.query(`DELETE FROM "master_division_list";`);
        await queryRunner.query(`DELETE FROM "master_company_list";`);
        await queryRunner.query(`DELETE FROM "identity";`);
    }
}
