# Quick Reference: Adding New Document Types

## Essential Steps (Checklist)

### 1. Create Core Files
```bash
# Create entity
touch src/modules/document/core/entities/documentType/{name}.entity.ts

# Create DTO  
touch src/modules/document/core/dto/{name}.dto.ts

# Create service
touch src/modules/document/document-type/{name}.service.ts
```

### 2. Update Integration Points

**File**: `src/modules/document/core/entities/index.ts`
```typescript
export * from './documentType/{name}.entity';
```

**File**: `src/modules/document/core/dto/document-list.dto.ts`
```typescript
// Add your document type specific fields
customField?: string;
```

**File**: `src/modules/document/document.service.ts`
```typescript
// Add import
import { {DocumentName} } from './core/entities/documentType/{name}.entity';

// Add repository injection  
@InjectRepository({DocumentName})
private readonly {name}Repository: Repository<{DocumentName}>,

// Add handling in findById method
if (document.type?.shortHand === '{SHORT_HAND}') {
  // Add document-specific field mapping
}
```

**File**: `src/modules/document/document-factory.service.ts`
```typescript
// Add import
import { {DocumentName}Service } from './document-type/{name}.service';

// Add service injection
private readonly {name}Service: {DocumentName}Service,

// Add mapping
['{SHORT_HAND}', this.{name}Service],
```

**File**: `src/modules/document/document.module.ts`
```typescript
// Add imports
import { {DocumentName} } from './core/entities/documentType/{name}.entity';
import { {DocumentName}Service } from './document-type/{name}.service';

// Add to TypeOrmModule.forFeature array
{DocumentName},

// Add to providers array
{DocumentName}Service,

// Add to exports array  
{DocumentName}Service,
```

### 3. Database Setup
```bash
# Generate migration
npm run migration:generate -- -n Add{DocumentName}DocumentType

# Run migration
npm run migration:run

# Insert document type record
INSERT INTO document_schema.document_type (type_name, shorthand) 
VALUES ('{Full Name}', '{SHORT_HAND}');
```

### 4. Testing
- [ ] Start application (check console for entity metadata logs)
- [ ] Test creation via `POST /documents/createV2/{SHORT_HAND}`
- [ ] Test retrieval via `GET /documents/{id}`
- [ ] Test finalization via `POST /documents/finalizeV2/{SHORT_HAND}`

## Templates

### Entity Template (Minimal)
```typescript
import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";

@Entity('{table_name}', { schema: Schemas.DOCUMENT })
export class {DocumentName} extends BaseVersionedDocument {
    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ name: 'master_document_list_id', type: 'uuid', nullable: false })
    masterDocumentId: string;

    @Column({ name: 'client_id', type: 'uuid' })
    clientId: string;

    @Column({ name: 'document_description', type: 'text' })
    documentDescription: string;

    // Add your custom fields here
}
```

### DTO Template (Minimal)
```typescript
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class {DocumentName}Dto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;

  // Add your custom fields with validation
}
```

### Service Template (Minimal)
```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { {DocumentName} } from '../core/entities/documentType/{name}.entity';
import { MasterDocumentList } from '../core/entities/master-document-list.entity';
import { {DocumentName}Dto } from '../core/dto/{name}.dto';

@Injectable()
export class {DocumentName}Service {
  private readonly logger = new Logger({DocumentName}Service.name);

  constructor(
    @InjectRepository({DocumentName})
    private {name}Repository: Repository<{DocumentName}>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    private connection: Connection,
  ) {}

  async create(masterDocument: MasterDocumentList, documentData: {DocumentName}Dto): Promise<{DocumentName}> {
    this.validate(documentData);
    
    // Implement creation logic
    // Use raw SQL or TypeORM save
    
    return createdDocument;
  }

  validate(documentData: any): void {
    if (!documentData.clientId) {
      throw new BadRequestException('Client ID is required');
    }
    if (!documentData.documentDescription) {
      throw new BadRequestException('Document description is required');
    }
  }

  async finalize(id: string, finalizationSummary: string, physicalDelivery: boolean): Promise<{ message: string }> {
    // Implement finalization logic
    return { message: 'Document finalized successfully' };
  }
}
```

## Common Field Types

```typescript
// String field
@Column({ name: 'field_name', type: 'varchar', length: 255, nullable: true })
fieldName: string;

// Text field  
@Column({ name: 'field_name', type: 'text' })
fieldName: string;

// Number field
@Column({ name: 'field_name', type: 'decimal', precision: 19, scale: 4 })
fieldName: number;

// Integer field
@Column({ name: 'field_name', type: 'int' })
fieldName: number;

// Boolean field
@Column({ name: 'field_name', type: 'boolean', default: false })
fieldName: boolean;

// Date field
@Column({ name: 'field_name', type: 'date', nullable: true })
fieldName: Date;

// JSON field
@Column({ name: 'field_name', type: 'jsonb', nullable: true })
fieldName: CustomInterface;

// UUID reference
@Column({ name: 'field_name', type: 'uuid' })
fieldName: string;
```

## Validation Decorators

```typescript
@IsString()           // String validation
@IsNumber()           // Number validation  
@IsBoolean()          // Boolean validation
@IsUUID()             // UUID validation
@IsDate()             // Date validation
@IsOptional()         // Optional field
@IsNotEmpty()         // Required field
@ValidateNested()     // Nested object validation
@Type(() => Date)     // Type transformation
``` 