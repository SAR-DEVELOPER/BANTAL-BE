/**
 * Asset History Payload Type Definitions
 *
 * TypeScript interfaces for JSONB payload fields in asset history events.
 * These types ensure type safety and consistency across the application.
 */

/**
 * Acquisition Event Payload
 * Auto-generated when asset is created
 */
export interface AcquisitionPayload {
    supplier: string;
    price: {
        amount: number;
        currency: string;
        vat?: number;
    };
    location: {
        officeId: string;
        officeName: string;
        roomId?: string;
        roomName?: string;
    };
    invoiceNumber?: string;
    taxInvoiceNumber?: string;
    warrantyEndDate?: string;
    purchaseOrderNumber?: string;
}

/**
 * Relocation Event Payload
 * Created when asset is moved between locations
 */
export interface RelocationPayload {
    fromLocation: {
        officeId: string;
        officeName: string;
        roomId?: string;
        roomName?: string;
    };
    toLocation: {
        officeId: string;
        officeName: string;
        roomId?: string;
        roomName?: string;
    };
    reason: string;
    movedBy: string;
}

/**
 * Assignment Event Payload
 * Created when asset is assigned or reassigned to an employee
 */
export interface AssignmentPayload {
    assignee: {
        employeeId: string;
        name: string;
        department: string;
        position: string;
    };
    previousAssignee?: {
        employeeId: string;
        name: string;
        department: string;
        position: string;
    };
    reason: string;
}

/**
 * Maintenance Event Payload
 * Manually created by users
 */
export interface MaintenancePayload {
    maintenanceType: 'repair' | 'service' | 'upgrade' | 'cleaning' | 'inspection';
    description: string;
    performedBy: string;
    vendorName?: string;
    cost?: {
        amount: number;
        currency: string;
        invoiceNumber?: string;
    };
    nextMaintenanceDate?: string;
    warrantyExtension?: string;
}

/**
 * Depreciation Event Payload
 * Records asset value changes over time
 */
export interface DepreciationPayload {
    method: 'straight_line' | 'declining_balance' | 'units_of_production';
    previousValue: number;
    newValue: number;
    currency: string;
    depreciationAmount: number;
    usefulLifeYears?: number;
    salvageValue?: number;
    period: {
        startDate: string;
        endDate: string;
    };
}

/**
 * Status Change Event Payload
 * Records asset status transitions
 */
export interface StatusChangePayload {
    previousStatus: string;
    newStatus: string;
    reason: string;
    changedBy: string;
}

/**
 * Disposal Event Payload
 * Created when asset is disposed of
 */
export interface DisposalPayload {
    method: 'sold' | 'donated' | 'scrapped' | 'recycled' | 'returned';
    reason: string;
    disposedBy: string;
    proceeds?: {
        amount: number;
        currency: string;
        buyerName?: string;
    };
    condition: 'good' | 'fair' | 'poor' | 'damaged' | 'non_functional';
}

// Union type for type safety
export type AssetHistoryPayload =
    | AcquisitionPayload
    | RelocationPayload
    | AssignmentPayload
    | MaintenancePayload
    | DepreciationPayload
    | StatusChangePayload
    | DisposalPayload;

// Type guards
export function isAcquisitionPayload(payload: any): payload is AcquisitionPayload {
    return payload && typeof payload.supplier === 'string' && 'price' in payload;
}

export function isRelocationPayload(payload: any): payload is RelocationPayload {
    return payload && 'fromLocation' in payload && 'toLocation' in payload;
}

export function isAssignmentPayload(payload: any): payload is AssignmentPayload {
    return payload && 'assignee' in payload && 'reason' in payload && !('maintenanceType' in payload);
}

export function isMaintenancePayload(payload: any): payload is MaintenancePayload {
    return payload && 'maintenanceType' in payload && 'description' in payload;
}

export function isDepreciationPayload(payload: any): payload is DepreciationPayload {
    return payload && 'method' in payload && 'depreciationAmount' in payload;
}

export function isStatusChangePayload(payload: any): payload is StatusChangePayload {
    return payload && 'previousStatus' in payload && 'newStatus' in payload;
}

export function isDisposalPayload(payload: any): payload is DisposalPayload {
    return payload && 'disposedBy' in payload && 'condition' in payload;
}
