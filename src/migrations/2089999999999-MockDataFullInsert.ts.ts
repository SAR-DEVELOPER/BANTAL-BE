import { MigrationInterface, QueryRunner } from "typeorm";

export class MockDataFullInsert2099999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
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

        // Insert into client_type
        await queryRunner.query(`
            INSERT INTO "client_type" (name, description, created_at, updated_at)
            VALUES 
            ('Perorangan', 'Individual client type', now(), now()),
            ('Badan (BUMN)', 'State-owned enterprise', now(), now()),
            ('Badan (BUMD)', 'Regional-owned enterprise', now(), now()),
            ('Badan (Swasta)', 'Private enterprise', now(), now()),
            ('Badan (Asing)', 'Foreign enterprise', now(), now());
        `);

        // Insert into master_client_list
        await queryRunner.query(`
            INSERT INTO "master_client_list" (name, "group", type_id, contact_name, contact_position, contact_email, contact_phone, referral_from, date_of_first_project, status, priority_number, created_at, updated_at)
            VALUES 
            ('PT Perkebunan Nusantara II', 'PTPN Group', (SELECT id FROM client_type WHERE name = 'Badan (BUMN)'), 'Ahmad Sutrisno', 'General Manager', 'ahmad.sutrisno@ptpn.co.id', '+62-21-5551234', 'Government referral', '2023-01-15', 'Active', 1, now(), now()),
            ('PT Kinra', 'Technology Group', (SELECT id FROM client_type WHERE name = 'Badan (Swasta)'), 'Sari Dewi', 'CEO', 'sari.dewi@kinra.co.id', '+62-21-5552345', 'Business network', '2023-03-20', 'Active', 2, now(), now()),
            ('PPT Energy Trading Ltd.', 'Energy Group', (SELECT id FROM client_type WHERE name = 'Badan (Asing)'), 'John Smith', 'Managing Director', 'john.smith@pptenergy.com', '+65-6123-4567', 'International partner', '2023-05-10', 'Active', 1, now(), now()),
            ('PT Bank Mandiri', 'Financial Group', (SELECT id FROM client_type WHERE name = 'Badan (BUMN)'), 'Rina Sari', 'Branch Manager', 'rina.sari@bankmandiri.co.id', '+62-21-5553456', 'Banking network', '2023-02-28', 'Active', 1, now(), now()),
            ('CV Maju Jaya', 'Trading Group', (SELECT id FROM client_type WHERE name = 'Badan (Swasta)'), 'Budi Santoso', 'Owner', 'budi@majujaya.co.id', '+62-21-5554567', 'Local business', '2023-04-12', 'Active', 3, now(), now()),
            ('Ir. Soekarno', null, (SELECT id FROM client_type WHERE name = 'Perorangan'), 'Soekarno', 'Individual', 'soekarno@email.com', '+62-812-3456-7890', 'Personal referral', '2023-06-01', 'Active', 2, now(), now()),
            ('PT Telkom Indonesia', 'Telecommunications Group', (SELECT id FROM client_type WHERE name = 'Badan (BUMN)'), 'Dian Pratiwi', 'Project Manager', 'dian.pratiwi@telkom.co.id', '+62-21-5555678', 'Government network', '2023-01-30', 'Active', 1, now(), now()),
            ('Singapore Energy Pte Ltd', 'Energy Group', (SELECT id FROM client_type WHERE name = 'Badan (Asing)'), 'Michael Tan', 'Director', 'michael.tan@sgenergy.sg', '+65-6234-5678', 'Regional expansion', '2023-07-15', 'Active', 2, now(), now());
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
        await queryRunner.query(`DELETE FROM "master_client_list";`);
        await queryRunner.query(`DELETE FROM "client_type";`);
        await queryRunner.query(`DELETE FROM "master_division_list";`);
        await queryRunner.query(`DELETE FROM "master_company_list";`);
        await queryRunner.query(`DELETE FROM "identity";`);
    }
}
