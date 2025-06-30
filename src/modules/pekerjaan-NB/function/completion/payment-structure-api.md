# Payment Structure Completion API Documentation

## Overview
The Payment Structure API provides a comprehensive solution for managing project payment structures and tracking completion status. This API uses a normalized database approach with separate entities for better data integrity and supports multi-trigger payment systems including milestone-based, event-based, date-based, and manual payments.

## Database Structure

### Primary Tables
- **Table**: `pekerjaan` - Contains basic payment information
- **Table**: `payment_installment` - Contains detailed installment information
- **Relationship**: One-to-Many (pekerjaan → payment_installments)

### Payment Integration
- **Milestone Integration**: Payments can be linked to project milestones
- **Event-Based Triggers**: Supports external business events (e.g., document submission)
- **Multi-Currency Support**: Built-in currency handling (default: IDR)

## Endpoints

### 1. Get Payment Structure & Completion Status
**Endpoint:** `POST /pekerjaan/completion/payment-structure`  
**Description:** Retrieves the current payment structure and calculates completion percentage based on 4-tier assessment.

#### Request Body
```json
{
  "projectId": "uuid-string"
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending", // "pending" | "completed"
  "completionPercentage": 75,
  "data": {
    "basicInfo": {
      "projectFee": 150000000,
      "currency": "IDR",
      "bankName": "Bank ABC",
      "accountNumber": "1234567890",
      "accountName": "PT Company Name"
    },
    "installments": [
      {
        "id": "inst-uuid-1",
        "installmentNumber": 1,
        "amount": 45000000,
        "percentage": 30,
        "triggerType": "milestone",
        "triggerValue": null,
        "projectMilestoneId": "milestone-uuid-123",
        "description": "Initial project payment",
        "status": "pending",
        "notes": "Payment after project setup completion",
        "dueDate": null
      },
      {
        "id": "inst-uuid-2",
        "installmentNumber": 2,
        "amount": 60000000,
        "percentage": 40,
        "triggerType": "event",
        "triggerValue": "document_submission",
        "projectMilestoneId": null,
        "description": "Payment after document submission",
        "status": "pending",
        "notes": "Triggered by government document submission",
        "dueDate": null
      },
      {
        "id": "inst-uuid-3",
        "installmentNumber": 3,
        "amount": 45000000,
        "percentage": 30,
        "triggerType": "date",
        "triggerValue": "2024-06-01",
        "projectMilestoneId": null,
        "description": "Final project payment",
        "status": "pending",
        "notes": "Final payment upon project completion",
        "dueDate": "2024-06-01"
      }
    ]
  },
  "message": "Payment structure is 75% complete"
}
```

---

### 2. Update Payment Structure
**Endpoint:** `POST /pekerjaan/completion/payment-structure`  
**Description:** Updates payment structure including basic info and installments (same endpoint, detected by presence of `data` field).

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "basicInfo": {
      "projectFee": 150000000,
      "currency": "IDR",
      "bankName": "Bank ABC",
      "accountNumber": "1234567890",
      "accountName": "PT Company Name"
    },
    "installments": [
      {
        "installmentNumber": 1,
        "amount": 45000000,
        "percentage": 30,
        "triggerType": "milestone",
        "projectMilestoneId": "milestone-uuid-123",
        "description": "Initial project payment",
        "notes": "Payment after project setup completion"
      },
      {
        "installmentNumber": 2,
        "amount": 60000000,
        "percentage": 40,
        "triggerType": "event",
        "triggerValue": "document_submission",
        "description": "Payment after document submission",
        "notes": "Triggered by government document submission"
      },
      {
        "installmentNumber": 3,
        "amount": 45000000,
        "percentage": 30,
        "triggerType": "date",
        "triggerValue": "2024-06-01",
        "description": "Final project payment",
        "notes": "Final payment upon project completion"
      }
    ]
  }
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "updated",
  "completionPercentage": 100,
  "data": {
    "basicInfo": { /* updated basic info */ },
    "installments": [ /* updated installments */ ]
  },
  "message": "Payment structure is 100% complete"
}
```

---

### 3. Delete Payment Installment
**Endpoint:** `POST /pekerjaan/completion/payment-structure/delete`  
**Description:** Removes a specific payment installment from the project.

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "installmentId": "inst-uuid-1"
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "updated",
  "completionPercentage": 50,
  "data": {
    "basicInfo": { /* current basic info */ },
    "installments": [ /* remaining installments */ ]
  },
  "message": "Payment structure is 50% complete"
}
```

## Payment Structure Format

### Basic Info Structure
```json
{
  "projectFee": 150000000,      // Total project value
  "currency": "IDR",            // Currency code (ISO 4217)
  "bankName": "Bank ABC",       // Receiving bank name
  "accountNumber": "1234567890", // Bank account number
  "accountName": "PT Company"   // Account holder name
}
```

### Payment Installment Structure
```json
{
  "id": "uuid",                 // Auto-generated installment ID
  "installmentNumber": 1,       // Sequential order number
  "amount": 45000000,          // Payment amount
  "percentage": 30,            // Percentage of total project fee
  "triggerType": "milestone",  // Payment trigger mechanism
  "triggerValue": "uuid",      // Trigger-specific value
  "projectMilestoneId": "uuid", // Link to project milestone (optional)
  "description": "Payment description",
  "status": "pending",         // Payment status
  "notes": "Additional notes",  // Optional notes
  "dueDate": "2024-06-01"      // Computed due date (for date triggers)
}
```

## Payment Trigger Types

| Trigger Type | Description | Trigger Value Format | Example Use Case |
|--------------|-------------|---------------------|------------------|
| `milestone` | Linked to project milestone | UUID of milestone | Payment after development phase |
| `event` | External business event | Event identifier string | Payment after document submission |
| `date` | Traditional due date | ISO date string | Monthly retainer payment |
| `manual` | Manual admin trigger | null or description | Ad-hoc payment requests |

### Supported Events
- `document_submission` - Payment triggered by document submission to government/client

*Note: Additional event types can be added based on business requirements.*

## Completion Logic

The completion percentage is calculated using a **4-tier assessment system** (25% weight each):

### Tier 1: Basic Info (25%)
- ✅ **Complete**: Project fee defined AND currency set
- ❌ **Incomplete**: Missing project fee OR currency

### Tier 2: Installments Defined (25%)
- ✅ **Complete**: At least one payment installment exists
- ❌ **Incomplete**: No installments defined

### Tier 3: Installment Configuration (25%)
- ✅ **Complete**: All installments have trigger types AND descriptions
- ❌ **Incomplete**: Any installment missing trigger type OR description

### Tier 4: Bank Details (25%)
- ✅ **Complete**: Bank name, account number, AND account name all provided
- ❌ **Incomplete**: Any bank detail missing

### Completion Examples
- **0%**: No payment structure defined
- **25%**: Only basic fee info (150M IDR)
- **50%**: Fee info + installments defined but incomplete
- **75%**: Fee + installments + proper triggers, missing bank details
- **100%**: Complete payment structure with all details

## Field Descriptions

### Basic Info Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectFee` | number | ✅ | Total project value in currency units |
| `currency` | string | ✅ | ISO 4217 currency code (default: IDR) |
| `bankName` | string | ❌ | Receiving bank name |
| `accountNumber` | string | ❌ | Bank account number |
| `accountName` | string | ❌ | Account holder name |

### Installment Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | ❌ | Auto-generated unique identifier |
| `installmentNumber` | number | ✅ | Sequential order (1, 2, 3...) |
| `amount` | number | ✅ | Payment amount (must be positive) |
| `percentage` | number | ✅ | Percentage of total (0-100) |
| `triggerType` | enum | ✅ | Payment trigger mechanism |
| `triggerValue` | string | ❌ | Trigger-specific value |
| `projectMilestoneId` | UUID | ❌ | Link to project milestone |
| `description` | string | ✅ | Payment description |
| `status` | enum | ❌ | Payment status (default: pending) |
| `notes` | string | ❌ | Additional notes |
| `dueDate` | Date | ❌ | Computed due date |

### Enum Values

#### Trigger Types
- `milestone` - Payment triggered by milestone completion
- `event` - Payment triggered by external business event
- `date` - Payment triggered by specific date
- `manual` - Payment triggered manually by admin

#### Payment Status
- `pending` - Payment not yet due
- `due` - Payment is due and can be requested
- `requested` - Payment request has been sent
- `paid` - Payment has been received

## Validation Rules

### Basic Info Validation
- **Project Fee**: Must be non-negative number
- **Currency**: Must be valid 3-character code
- **Bank Details**: Optional but recommended for completion

### Installment Validation
- **Total Percentage**: All installments must sum to exactly 100%
- **Installment Numbers**: Must be sequential and unique
- **Amounts**: Must be positive numbers
- **Milestone References**: Must exist in project milestones table
- **Event Triggers**: Must be from supported event list
- **Date Triggers**: Must be valid ISO date format

### Business Rules
- At least one installment required for completion
- Milestone triggers must reference existing milestones
- Date triggers automatically populate `dueDate` field
- Event triggers require valid event identifier

## Error Responses

### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Pekerjaan with id {projectId} not found"
}
```

### 400 - Validation Errors

#### Invalid Project Fee
```json
{
  "statusCode": 400,
  "message": "Project fee cannot be negative"
}
```

#### Invalid Percentage Total
```json
{
  "statusCode": 400,
  "message": "Total installment percentages must equal 100%"
}
```

#### Invalid Milestone Reference
```json
{
  "statusCode": 400,
  "message": "Milestone with id {milestoneId} not found for this project"
}
```

#### Invalid Event Type
```json
{
  "statusCode": 400,
  "message": "Only \"document_submission\" event is currently supported"
}
```

#### Invalid Date Format
```json
{
  "statusCode": 400,
  "message": "Invalid due date format"
}
```

#### Installment Not Found
```json
{
  "statusCode": 404,
  "message": "Payment installment with id {installmentId} not found for this project"
}
```

## Usage Examples

### Complete Payment Structure Setup Flow

#### 1. Check Current Status
```javascript
const currentStatus = await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: "project-uuid-here" })
});
```

#### 2. Set Up Basic Info
```javascript
const basicInfoUpdate = await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    data: {
      basicInfo: {
        projectFee: 150000000,
        currency: "IDR",
        bankName: "Bank Central Asia",
        accountNumber: "1234567890",
        accountName: "PT Tech Solutions"
      }
    }
  })
});
```

#### 3. Add Payment Installments
```javascript
const installmentsUpdate = await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    data: {
      installments: [
        {
          installmentNumber: 1,
          amount: 45000000,
          percentage: 30,
          triggerType: "milestone",
          projectMilestoneId: "milestone-setup-uuid",
          description: "Initial payment after project setup",
          notes: "Released when development environment is ready"
        },
        {
          installmentNumber: 2,
          amount: 75000000,
          percentage: 50,
          triggerType: "milestone",
          projectMilestoneId: "milestone-development-uuid", 
          description: "Payment after development completion",
          notes: "Released when main features are complete"
        },
        {
          installmentNumber: 3,
          amount: 30000000,
          percentage: 20,
          triggerType: "date",
          triggerValue: "2024-06-01",
          description: "Final payment upon delivery",
          notes: "Final project completion payment"
        }
      ]
    }
  })
});
```

### Partial Updates

#### Update Only Bank Details
```javascript
await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    data: {
      basicInfo: {
        bankName: "Bank Mandiri",
        accountNumber: "9876543210"
      }
    }
  })
});
```

#### Add Single Installment
```javascript
await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    data: {
      installments: [
        {
          installmentNumber: 4,
          amount: 15000000,
          percentage: 10,
          triggerType: "event",
          triggerValue: "document_submission",
          description: "Bonus payment after document submission",
          notes: "Additional payment for government documentation"
        }
      ]
    }
  })
});
```

#### Update Existing Installment
```javascript
await fetch('/pekerjaan/completion/payment-structure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    data: {
      installments: [
        {
          id: "existing-installment-uuid",
          installmentNumber: 1,
          amount: 50000000, // Updated amount
          percentage: 33.33, // Updated percentage
          triggerType: "milestone",
          projectMilestoneId: "milestone-setup-uuid",
          description: "Updated initial payment",
          notes: "Increased initial payment amount"
        }
      ]
    }
  })
});
```

#### Delete Installment
```javascript
await fetch('/pekerjaan/completion/payment-structure/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "project-uuid-here",
    installmentId: "installment-to-delete-uuid"
  })
});
```

## Business Scenarios

### Scenario 1: Traditional Fixed-Date Payments
```json
{
  "installments": [
    {
      "installmentNumber": 1,
      "percentage": 50,
      "triggerType": "date",
      "triggerValue": "2024-03-01",
      "description": "First half payment"
    },
    {
      "installmentNumber": 2,
      "percentage": 50,
      "triggerType": "date", 
      "triggerValue": "2024-06-01",
      "description": "Final payment"
    }
  ]
}
```

### Scenario 2: Milestone-Based Payments
```json
{
  "installments": [
    {
      "installmentNumber": 1,
      "percentage": 25,
      "triggerType": "milestone",
      "projectMilestoneId": "design-completion-uuid",
      "description": "Payment after design approval"
    },
    {
      "installmentNumber": 2,
      "percentage": 50,
      "triggerType": "milestone",
      "projectMilestoneId": "development-completion-uuid", 
      "description": "Payment after development"
    },
    {
      "installmentNumber": 3,
      "percentage": 25,
      "triggerType": "milestone",
      "projectMilestoneId": "deployment-completion-uuid",
      "description": "Final payment after deployment"
    }
  ]
}
```

### Scenario 3: Mixed Trigger Types
```json
{
  "installments": [
    {
      "installmentNumber": 1,
      "percentage": 30,
      "triggerType": "milestone",
      "projectMilestoneId": "project-start-uuid",
      "description": "Initial payment"
    },
    {
      "installmentNumber": 2,
      "percentage": 40,
      "triggerType": "event",
      "triggerValue": "document_submission",
      "description": "Payment after government submission"
    },
    {
      "installmentNumber": 3,
      "percentage": 30,
      "triggerType": "date",
      "triggerValue": "2024-12-31",
      "description": "Year-end final payment"
    }
  ]
}
```

### Scenario 4: Government Project with Document Dependencies
```json
{
  "installments": [
    {
      "installmentNumber": 1,
      "percentage": 20,
      "triggerType": "milestone",
      "projectMilestoneId": "project-initiation-uuid",
      "description": "Project initiation payment"
    },
    {
      "installmentNumber": 2, 
      "percentage": 30,
      "triggerType": "event",
      "triggerValue": "document_submission",
      "description": "Payment after permit submission",
      "notes": "Triggered when all permits are submitted to government"
    },
    {
      "installmentNumber": 3,
      "percentage": 35,
      "triggerType": "milestone", 
      "projectMilestoneId": "implementation-complete-uuid",
      "description": "Payment after implementation"
    },
    {
      "installmentNumber": 4,
      "percentage": 15,
      "triggerType": "manual",
      "description": "Final approval payment",
      "notes": "Released manually after final government approval"
    }
  ]
}
```

## Integration Notes

### SPK Document Integration
When an SPK (Surat Perjanjian Kerja) document is finalized:
- Basic payment info can be pre-populated from SPK fields
- `projectFee` extracted from SPK `projectFee` field
- `paymentInstallment` count used as initial installment guidance

### Project Milestone Integration
- Payment installments can reference existing project milestones
- When milestones are completed, linked payments automatically become "due"
- Milestone deletion should be validated against payment dependencies

### Future Enhancements
- **Auto-trigger System**: Automatic payment status updates when milestones complete
- **Payment Request Generation**: Generate formal payment requests from due installments
- **Multi-currency Support**: Enhanced currency conversion and management
- **Payment History Tracking**: Audit trail for payment status changes
- **External Event Webhooks**: Integration with external systems for event triggers

## Notes
- **Flexible Structure**: Payment structure supports various business models
- **Data Integrity**: Normalized approach ensures referential integrity
- **Validation**: Comprehensive validation prevents data inconsistencies
- **Extensible**: Easy to add new trigger types and payment statuses
- **Business-Focused**: Designed around real-world payment scenarios
- **Performance**: Indexed relationships for efficient querying 