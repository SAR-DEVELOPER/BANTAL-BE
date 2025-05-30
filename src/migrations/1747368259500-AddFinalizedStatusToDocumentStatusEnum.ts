import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinalizedStatusToDocumentStatusEnum1715842048000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the enum type exists, if not create it first
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type 
            WHERE typname = 'master_document_list_document_status_enum' 
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'document_schema')
        `);

        if (enumExists.length === 0) {
            // Create the enum type if it doesn't exist
            await queryRunner.query(`
                CREATE TYPE "document_schema"."master_document_list_document_status_enum" AS ENUM(
                    'DRAFT', 'PENDING', 'SIGNED', 'ACTIVE', 'ARCHIVED', 'EXPIRED', 'CANCELLED', 'REJECTED'
                );
            `);
        }

        // Check if FINALIZED value already exists
        const finalizedExists = await queryRunner.query(`
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typname = 'master_document_list_document_status_enum'
            AND n.nspname = 'document_schema'
            AND e.enumlabel = 'FINALIZED'
        `);

        if (finalizedExists.length === 0) {
            // Add the new enum value
            await queryRunner.query(`
                ALTER TYPE document_schema.master_document_list_document_status_enum 
                ADD VALUE 'FINALIZED';
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing enum values
        // We can only add new values, not remove them
        // This is a limitation of PostgreSQL enums
        console.log('Cannot remove enum value as PostgreSQL does not support it');
    }
} 