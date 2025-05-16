import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinalizedStatusToDocumentStatusEnum1715842048000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new enum value
        await queryRunner.query(`
            ALTER TYPE document_schema.master_document_list_document_status_enum 
            ADD VALUE IF NOT EXISTS 'FINALIZED';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing enum values
        // We can only add new values, not remove them
        // This is a limitation of PostgreSQL enums
        console.log('Cannot remove enum value as PostgreSQL does not support it');
    }
} 