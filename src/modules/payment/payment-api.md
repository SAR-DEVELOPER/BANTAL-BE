# Payment API Documentation

## Overview
The Payment API provides dedicated endpoints for managing payment structures based on pekerjaan (project) IDs. This API allows you to get and update payment information, manage installments, and track completion status.

## Base URL
```
/payment
```

## Endpoints

### 1. Get Payment Structure
**Endpoint:** `GET /payment/:pekerjaanId`  
**Description:** Retrieves the complete payment structure for a specific pekerjaan ID.

#### Parameters
- `pekerjaanId` (UUID, required): The unique identifier of the pekerjaan

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
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
      }
    ]
  },
  "message": "Payment structure is 75% complete"
}
```

---

### 2. Update Payment Structure
**Endpoint:** `PUT /payment/:pekerjaanId`  
**Description:** Updates the payment structure for a specific pekerjaan ID.

#### Parameters
- `pekerjaanId` (UUID, required): The unique identifier of the pekerjaan

#### Request Body
```json
{
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
      "description": "Payment after document submission"
    },
    {
      "installmentNumber": 3,
      "amount": 45000000,
      "percentage": 30,
      "triggerType": "date",
      "triggerValue": "2024-06-01",
      "description": "Final project payment"
    }
  ]
}
```

#### Response
Same structure as GET endpoint with updated data.

---

### 3. Get Payment Status
**Endpoint:** `GET /payment/:pekerjaanId/status`  
**Description:** Retrieves only the completion status and percentage for a specific pekerjaan.

#### Parameters
- `pekerjaanId` (UUID, required): The unique identifier of the pekerjaan

#### Response
```json
{
  "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
  "completionPercentage": 75,
  "status": "pending",
  "message": "Payment structure is 75% complete"
}
```

---

### 4. Delete Payment Installment
**Endpoint:** `PUT /payment/:pekerjaanId/installments/:installmentId/delete`  
**Description:** Deletes a specific payment installment from the project.

#### Parameters
- `pekerjaanId` (UUID, required): The unique identifier of the pekerjaan
- `installmentId` (UUID, required): The unique identifier of the installment to delete

#### Response
Same structure as GET endpoint with the installment removed.

## Data Structures

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
  "id": "uuid",                 // Auto-generated installment ID (for updates)
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

## Completion Percentage Calculation

The completion percentage is calculated based on 4 criteria (25% each):

1. **Basic Info** (25%): Project fee and currency are set
2. **Installments Defined** (25%): At least one installment exists
3. **Installments Complete** (25%): All installments have proper triggers and descriptions
4. **Bank Details** (25%): Bank name, account number, and account name are provided

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

## Error Responses

### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Pekerjaan with id {pekerjaanId} not found"
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

#### Missing Update Data
```json
{
  "statusCode": 400,
  "message": "Update data must contain either basicInfo or installments"
}
```

## Usage Examples

### Get Payment Structure
```bash
curl -X GET "http://localhost:3000/payment/550e8400-e29b-41d4-a716-446655440000"
```

### Update Payment Structure
```bash
curl -X PUT "http://localhost:3000/payment/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": {
      "projectFee": 150000000,
      "currency": "IDR",
      "bankName": "Bank ABC",
      "accountNumber": "1234567890",
      "accountName": "PT Company Name"
    }
  }'
```

### Get Payment Status Only
```bash
curl -X GET "http://localhost:3000/payment/550e8400-e29b-41d4-a716-446655440000/status"
``` 