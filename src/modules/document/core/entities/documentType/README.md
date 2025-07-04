# Document Type System - Developer Guide

## Overview

The Document Type system uses a hierarchical architecture where each specific document type (like `SuratPenawaran`, `SuratPerjanjianKerja`, `SuratTagihanNonBulanan`) extends a base versioned document system. This guide explains how to add new document types to the system.

## Architecture Overview

```
MasterDocumentList (Master document registry)
    ↓ (one-to-many)
BaseVersionedDocument (Abstract base with versioning)
    ↓ (extends)
Specific Document Types (SuratPenawaran, SPK, TagNB, etc.)
```

### Key Components:
- **MasterDocumentList**: Central registry for all documents
- **BaseVersionedDocument**: Abstract base providing versioning and audit capabilities
- **Document Type Entities**: Specific implementations with custom fields
- **Document Factory**: Routes document operations to appropriate services
- **Generic Controllers**: Handle CRUD operations for all document types

## Step-by-Step Guide to Add a New Document Type

### 0. Add Document Type to Database FIRST ⚠️

**CRITICAL FIRST STEP**: Before creating any code files, you MUST add the document type record to the database:

```sql
INSERT INTO document_schema.document_type (type_name, shorthand, created_at, updated_at) 
VALUES ('{Document Type Name}', '{SHORT_HAND}', NOW(), NOW());
```

**Example:**
```sql
INSERT INTO document_schema.document_type (type_name, shorthand, created_at, updated_at) 
VALUES ('Surat Tagihan Non Bulanan', 'TagNB', NOW(), NOW());
```

> ⚠️ **IMPORTANT**: The document type record MUST exist in the database before creating entities and services. The system validates document creation requests against this table, and missing entries will cause runtime errors.

> 💡 **TIP**: Choose a meaningful shorthand (3-5 characters) as it will be used in API endpoints like `POST /documents/createV2/{SHORT_HAND}` and `POST /documents/finalizeV2/{SHORT_HAND}`.

### 1. Create the Entity

**Location**: `src/modules/document/core/entities/documentType/`

**File**: `{document-name}.entity.ts`

```typescript
/**
 * {DocumentName} Entity ({Display Name})
 * 
 * This entity represents {description} in the system.
 * 
 * Table: {table_name} (in DOCUMENT schema)
 * 
 * Columns:
 * - {field1}: {type}, {description}
 * - {field2}: {type}, {description}
 * 
 * Inherits from BaseVersionedDocument:
 * - id (PK): UUID, auto-generated
 * - version: Document version tracking
 * - isLatest: Boolean, indicates if this is the latest version
 * - uploadedBy: UUID, identifies the user who uploaded the document
 * - masterDocumentId: References the parent document in MasterDocumentList
 * 
 * Also inherits all audit fields from BaseEntity through BaseVersionedDocument:
 * - createdAt: Creation timestamp
 * - updatedAt: Last update timestamp
 */

import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";

// Define interfaces for complex types if needed
interface CustomDataType {
    field1?: string;
    field2?: number;
}

@Entity('{table_name}', { schema: Schemas.DOCUMENT })
export class {DocumentName} extends BaseVersionedDocument {
    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @Column({
        name: 'master_document_list_id',
        type: 'uuid',
        nullable: false
    })
    masterDocumentId: string;

    // Common fields (recommended to include)
    @Column({
        name: 'client_id', 
        type: 'uuid',
    })
    clientId: string;

    @Column({
        name: 'document_description',
        type: 'text',
    })
    documentDescription: string;

    // Add your custom fields here
    @Column({
        name: 'custom_field',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    customField: string;

    @Column({
        name: 'numeric_field',
        type: 'decimal',
        precision: 19,
        scale: 4,
        nullable: true,
    })
    numericField: number;

    @Column({
        name: 'json_field',
        type: 'jsonb',
        nullable: true
    })
    jsonField: CustomDataType;

    @Column({
        name: 'boolean_field',
        type: 'boolean',
        default: false
    })
    booleanField: boolean;
}
```

### 2. Create the DTO

**Location**: `src/modules/document/core/dto/`

**File**: `{document-name}.dto.ts`

```typescript
import { IsString, IsUUID, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

interface CustomDataType {
    field1?: string;
    field2?: number;
}

/**
 * DTO for {DocumentName} ({Display Name}) document type
 */
export class {DocumentName}Dto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;

  // Add validation for your custom fields
  @IsString()
  @IsOptional()
  customField?: string;

  @IsNumber()
  @IsOptional()
  numericField?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  jsonField?: CustomDataType;

  @IsBoolean()
  @IsOptional()
  booleanField?: boolean;
}
```

### 3. Create the Service

**Location**: `src/modules/document/document-type/`

**File**: `{document-name}.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { {DocumentName} } from '../core/entities/documentType/{document-name}.entity';
import { MasterDocumentList } from '../core/entities/master-document-list.entity';
import { {DocumentName}Dto } from '../core/dto/{document-name}.dto';
import { DocumentStatus } from '../core/enums/document-status.enum';

@Injectable()
export class {DocumentName}Service {
  private readonly logger = new Logger({DocumentName}Service.name);

  constructor(
    @InjectRepository({DocumentName})
    private {documentName}Repository: Repository<{DocumentName}>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    private connection: Connection,
  ) {
    // Log entity metadata on service initialization
    setTimeout(() => {
      this.logEntityMetadata();
    }, 1000);
  }

  /**
   * Create a new {DocumentName} document
   * @param masterDocument The master document reference
   * @param documentData The specific data for {DocumentName}
   * @returns Created {DocumentName} document
   */
  async create(masterDocument: MasterDocumentList, documentData: {DocumentName}Dto): Promise<{DocumentName}> {
    this.logger.debug(`Creating {DocumentName} for master document ID: ${masterDocument.id}`);
    this.logger.debug(`Document data: ${JSON.stringify(documentData)}`);
    
    // Validate the document data
    try {
      this.validate(documentData);
      this.logger.debug('Document data validation passed');
    } catch (error) {
      this.logger.error(`Document data validation failed: ${error.message}`);
      throw error;
    }
    
    const { 
      clientId, 
      documentDescription, 
      customField,
      numericField,
      jsonField,
      booleanField
    } = documentData;

    try {
      // Use raw SQL approach for better control
      const insertResult = await this.{documentName}Repository.query(
        `INSERT INTO document_schema.{table_name} (
          client_id, 
          document_description,
          custom_field,
          numeric_field,
          json_field,
          boolean_field,
          version_number, 
          is_latest, 
          uploaded_by, 
          master_document_list_id,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        ) RETURNING id`,
        [
          clientId,
          documentDescription,
          customField,
          numericField,
          JSON.stringify(jsonField),
          booleanField,
          1,
          true,
          masterDocument.createdBy?.id || 'system',
          masterDocument.id
        ]
      );

      this.logger.debug(`Direct SQL insert result: ${JSON.stringify(insertResult)}`);
      
      if (insertResult && insertResult.length > 0) {
        const insertedId = insertResult[0].id;
        
        // Fetch the freshly created document
        const createdDocument = await this.{documentName}Repository.findOne({
          where: { id: insertedId },
          relations: ['masterDocument']
        });
        
        if (createdDocument) {
          this.logger.debug(`Successfully created and retrieved {DocumentName} with ID: ${createdDocument.id}`);
          return createdDocument;
        } else {
          throw new Error(`Failed to retrieve created document with ID: ${insertedId}`);
        }
      } else {
        throw new Error('Insert operation did not return an ID');
      }
    } catch (error) {
      this.logger.error(`Error creating {DocumentName}: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Custom validation for {DocumentName} document type
   * @param documentData The document data to validate
   */
  validate(documentData: any): void {
    this.logger.debug(`Validating document data: ${JSON.stringify(documentData)}`);
    
    if (!documentData.clientId) {
      throw new BadRequestException('Client ID is required for {DocumentName}');
    }
    
    if (!documentData.documentDescription) {
      throw new BadRequestException('Document description is required for {DocumentName}');
    }
    
    // Add custom validation logic here
    if (documentData.numericField !== undefined && documentData.numericField < 0) {
      throw new BadRequestException('Numeric field must be positive for {DocumentName}');
    }
    
    this.logger.debug('All required fields are present');
  }

  /**
   * Finalize a {DocumentName} document
   * @param id Document UUID
   * @param finalizationSummary Summary of the finalization
   * @param physicalDelivery Whether physical delivery is required
   * @param mongoDocumentIds Optional MongoDB document IDs for attached files
   * @returns Finalization result
   */
  async finalize(
    id: string,
    finalizationSummary: string,
    physicalDelivery: boolean,
    mongoDocumentIds: string[] = []
  ): Promise<{ message: string }> {
    this.logger.debug(`Finalizing {DocumentName} document with ID ${id}`);

    // Find the master document
    const masterDocument = await this.{documentName}Repository.findOne({
      where: { masterDocumentId: id },
      relations: ['masterDocument'],
    });

    if (!masterDocument) {
      throw new NotFoundException(`{DocumentName} data for document with ID "${id}" not found`);
    }

    // Start a transaction for data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update master document status
      masterDocument.masterDocument.documentStatus = DocumentStatus.FINALIZED;
      await queryRunner.manager.save(masterDocument.masterDocument);

      // Log the finalization details
      this.logger.debug(`Finalization summary: ${finalizationSummary}`);
      this.logger.debug(`Physical delivery: ${physicalDelivery}`);
      if (mongoDocumentIds.length > 0) {
        this.logger.debug(`Attached document IDs: ${mongoDocumentIds.join(', ')}`);
      }

      // Add document-type-specific finalization logic here
      // For example, sending notifications, updating related records, etc.
      
      // Log the successful finalization
      this.logger.debug(`{DocumentName} document ${id} finalized successfully`);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: '{DocumentName} document has been successfully finalized'
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error finalizing {DocumentName} document: ${error.message}`);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private logEntityMetadata() {
    // Log entity metadata on service initialization
    const metadata = this.{documentName}Repository.metadata;
    this.logger.log(`{DocumentName} entity metadata initialized:`);
    this.logger.log(`Table name: ${metadata.tableName}`);
    this.logger.log(`Schema: ${metadata.schema}`);
    this.logger.log(`Columns: ${metadata.columns.map(col => col.propertyName).join(', ')}`);
  }
}
```

### 4. Update Entity Index

**Location**: `src/modules/document/core/entities/index.ts`

Add your new entity export:

```typescript
export * from './documentType/{document-name}.entity';
```

### 5. Update DocumentListDto

**Location**: `src/modules/document/core/dto/document-list.dto.ts`

Add fields for your document type after existing document type fields:

```typescript
// {DocumentName} specific fields
customField?: string;
numericField?: number;
jsonField?: {
  field1?: string;
  field2?: number;
};
booleanField?: boolean;
```

### 6. Update DocumentService

**Location**: `src/modules/document/document.service.ts`

#### 6.1 Add Import
```typescript
import { {DocumentName} } from './core/entities/documentType/{document-name}.entity';
```

#### 6.2 Add Repository Injection
```typescript
@InjectRepository({DocumentName})
private readonly {documentName}Repository: Repository<{DocumentName}>,
```

#### 6.3 Add Document Type Handling in findById method
```typescript
// If this is a {DocumentName}, add the specific fields
if (document.type?.shortHand === '{SHORT_HAND}') {
  const {documentName} = await this.{documentName}Repository.findOne({
    where: { masterDocumentId: document.id },
  });

  if ({documentName}) {
    documentDto.clientId = {documentName}.clientId;
    documentDto.documentDescription = {documentName}.documentDescription;
    documentDto.customField = {documentName}.customField;
    documentDto.numericField = {documentName}.numericField;
    documentDto.jsonField = {documentName}.jsonField;
    documentDto.booleanField = {documentName}.booleanField;
    documentDto.versionNumber = {documentName}.versionNumber;
    documentDto.isLatest = {documentName}.isLatest;
    documentDto.uploadedBy = {documentName}.uploadedBy;
  }
}
```

### 7. Update DocumentFactoryService

**Location**: `src/modules/document/document-factory.service.ts`

#### 7.1 Add Import
```typescript
import { {DocumentName}Service } from './document-type/{document-name}.service';
```

#### 7.2 Add Service Injection
```typescript
private readonly {documentName}Service: {DocumentName}Service,
```

#### 7.3 Register Service Mapping
```typescript
['{SHORT_HAND}', this.{documentName}Service], // ShortHand for {DocumentName}
```

#### 7.4 Add Logger Entry
```typescript
this.logger.log(`{SHORT_HAND} -> ${this.{documentName}Service.constructor.name}`);
```

### 8. Update DocumentModule

**Location**: `src/modules/document/document.module.ts`

#### 8.1 Add Imports
```typescript
import { {DocumentName} } from './core/entities/documentType/{document-name}.entity';
import { {DocumentName}Service } from './document-type/{document-name}.service';
```

#### 8.2 Add to TypeOrmModule.forFeature
```typescript
// Document type entities
{DocumentName},
```

#### 8.3 Add to Providers
```typescript
// Document type services
{DocumentName}Service,
```

#### 8.4 Add to Exports
```typescript
{DocumentName}Service,
```

### 9. Create Migration

**Location**: `src/migrations/`

Generate a new migration using TypeORM CLI or create manually:

```bash
npm run migration:generate -- -n Add{DocumentName}DocumentType
```

Or create manually:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class Add{DocumentName}DocumentType{timestamp} implements MigrationInterface {
    name = 'Add{DocumentName}DocumentType{timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_schema"."{table_name}" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "master_document_list_id" uuid NOT NULL, 
            "version_number" integer NOT NULL, 
            "is_latest" boolean NOT NULL DEFAULT true, 
            "uploaded_by" uuid NOT NULL, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "client_id" uuid NOT NULL, 
            "document_description" text NOT NULL,
            "custom_field" varchar(255),
            "numeric_field" decimal(19,4),
            "json_field" jsonb,
            "boolean_field" boolean DEFAULT false,
            CONSTRAINT "PK_{random_id}" PRIMARY KEY ("id")
        )`);
        
        await queryRunner.query(`ALTER TABLE "document_schema"."{table_name}" 
            ADD CONSTRAINT "FK_{random_id}" 
            FOREIGN KEY ("master_document_list_id") 
            REFERENCES "document_schema"."master_document_list"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_schema"."{table_name}" 
            DROP CONSTRAINT "FK_{random_id}"`);
        await queryRunner.query(`DROP TABLE "document_schema"."{table_name}"`);
    }
}
```

### 10. Optional: Create Specific Controller (if needed)

If you need document-type-specific endpoints beyond the generic CRUD:

**Location**: `src/modules/document/`

**File**: `{document-name}.controller.ts`

```typescript
import { Controller, Get, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { {DocumentName}Service } from './document-type/{document-name}.service';
import { {DocumentName} } from './core/entities/documentType/{document-name}.entity';

@Controller('documents/{endpoint}')
export class {DocumentName}Controller {
  constructor(private readonly {documentName}Service: {DocumentName}Service) {}

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<{DocumentName}> {
    try {
      return await this.{documentName}Service.getById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`{DocumentName} document with ID "${id}" not found`);
    }
  }
}
```

Don't forget to register the controller in `DocumentModule`!

## File Checklist

When adding a new document type, ensure you've completed these steps in order:

### CRITICAL FIRST STEP:
- [ ] **Insert document type record into `document_type` table** *(MUST BE DONE FIRST!)*

### Required Files:
- [ ] `src/modules/document/core/entities/documentType/{document-name}.entity.ts` *(NEW)*
- [ ] `src/modules/document/core/dto/{document-name}.dto.ts` *(NEW)*
- [ ] `src/modules/document/document-type/{document-name}.service.ts` *(NEW)*
- [ ] `src/modules/document/core/entities/index.ts` *(UPDATE)*
- [ ] `src/modules/document/core/dto/document-list.dto.ts` *(UPDATE)*
- [ ] `src/modules/document/document.service.ts` *(UPDATE)*
- [ ] `src/modules/document/document-factory.service.ts` *(UPDATE)*
- [ ] `src/modules/document/document.module.ts` *(UPDATE)*
- [ ] `src/migrations/{timestamp}-Add{DocumentName}DocumentType.ts` *(NEW)*

### Optional Files:
- [ ] `src/modules/document/{document-name}.controller.ts` *(NEW, if specific endpoints needed)*

### Database Updates:
- [ ] Run migration to create table

## Naming Conventions

- **Entity Class**: PascalCase (`SuratTagihanNonBulanan`)
- **Entity File**: kebab-case (`surat-tagihan-non-bulanan.entity.ts`)
- **DTO Class**: PascalCase + "Dto" (`SuratTagihanNonBulananDto`)
- **Service Class**: PascalCase + "Service" (`SuratTagihanNonBulananService`)
- **Table Name**: snake_case (`surat_tagihan_non_bulanan`)
- **Column Names**: snake_case (`client_id`, `document_description`)
- **Short Hand**: Abbreviated version (`TagNB`, `SPK`, `SP`)

## Testing Your Implementation

1. **Start the application** and check console logs for entity metadata
2. **Test document creation** using the generic `CreateDocumentController`
3. **Test document retrieval** using the `DocumentController`
4. **Test document finalization** using the `FinalizeDocumentController`
5. **Verify database tables** are created correctly
6. **Check factory service mapping** in application logs

## Common Pitfalls

1. **Missing entity export** in `index.ts`
2. **Incorrect repository injection** in DocumentService
3. **Missing service registration** in DocumentFactoryService
4. **Forgetting to add entity to DocumentModule**
5. **Column name mismatches** between entity and migration
6. **Missing foreign key constraints** in migration
7. **Validation logic not reflecting actual business rules**

## Best Practices

1. **Always include comprehensive JSDoc** in entity files
2. **Use meaningful validation messages** in DTOs
3. **Include proper error handling** in services
4. **Use transactions** for complex operations
5. **Log important operations** for debugging
6. **Follow consistent naming patterns**
7. **Add proper TypeScript interfaces** for complex JSON fields
8. **Include proper foreign key relationships** where applicable
9. **Test thoroughly** before deploying to production

## Example: Complete Implementation

For a complete example, refer to the `SuratTagihanNonBulanan` implementation which includes:
- Complex financial fields with decimal precision
- JSONB storage for bank information
- Comprehensive validation
- Proper error handling
- Complete integration with all system components 