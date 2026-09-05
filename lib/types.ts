// User Roles
export type UserRole = 'ADMIN' | 'HOD' | 'LAB_IN_CHARGE' | 'MA' | 'LAB_TO' | 'IMO';

// Spring Boot Standard Response Wrapper
export interface StandardResponse<T> {
  code: number;
  message: string;
  data: T;
  role?: string;
}

// User Entity
export interface User {
  id: number;
  f_Name: string;
  l_Name: string;
  email: string;
  contactNo: string;
  gender: string;
  role: UserRole;
  state: boolean; // false = pending, true = approved
  departmentId?: number; // Maps to Department.id
  department?: string;  // Department name (populated on login for non-admin roles)
}

// Department
export interface Department {
  id: number;
  name: string;
  code: string;
  status: boolean; // active/inactive
  description?: string;
}

// Inventory Category
export interface InventoryCategory {
  id: number;
  categoryName: string;
  categoryDesc?: string;
}

// Inventory Item Types
export type ItemType = 'CAPITAL' | 'SIMPLE';
export type ItemStatus = 'ACTIVE' | 'DISUSED';

export interface InventoryItem {
  id: number;
  name: string;
  type: ItemType;
  categoryId: number;
  departmentId: number;
  specifications?: string;
  quantity: number;
  threshold?: number;
  location?: string;
  status: ItemStatus;
  createdAt: string; // ISO DateTime string
}

// Inventory Request
export type RequestStatus = 'SUBMITTED' | 'PENDING_IN_CHARGE' | 'PENDING_MA' | 'PENDING_HOD' | 'PENDING_ADMIN' | 'PENDING_WELFARE' | 'COMPLETED' | 'REJECTED' | 'PURCHASED';

export interface DecisionDTO {
  approve: boolean;
  reason?: string;
}

export interface RequestHistory {
  id: number;
  actedById: number;
  actedByName?: string;
  role: string;
  action: string;
  reason?: string;
  timestamp: string;
}

export interface InventoryRequest {
  id: number;
  itemName: string;
  itemType: ItemType;
  categoryId: number;
  departmentId: number;
  quantity: number;
  purpose?: string;
  specifications?: string;
  status: RequestStatus;
  requestedById: number;
  technicalRemarks?: string;
  labInChargeId?: number;
  hodId?: number;
  imoId?: number;
  maId?: number;
  purchaseDetails?: string;
  requestDate: string;
  updatedAt: string;
  history?: RequestHistory[];
}

// Maintenance Record
export type MaintenanceStatus = 'PENDING' | 'APPROVED' | 'IN_SERVICE' | 'COMPLETED' | 'REJECTED';

export interface MaintenanceRecord {
  id: number;
  inventoryItemId: number;
  description?: string;
  status: MaintenanceStatus;
  requestedById: number;
  approvedById?: number;
  serviceProvider?: string;
  completionNotes?: string;
  cost?: number;
  requestedDate: string;
  startDate?: string;
  endDate?: string;
}

// Audit Log
export interface AuditLog {
  id: number;
  userEmail: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  timestamp: string;
}
