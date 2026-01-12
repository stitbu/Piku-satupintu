
/**
 * CORE ERP SCHEMA
 * Phase 1: Architecture Definitions
 */

// --- ENUMS & CONSTANTS ---

export type CompanyCode = 'PK' | 'KS';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PK = 'ADMIN_PK', // Admin Pintu Kuliah
  ADMIN_KS = 'ADMIN_KS', // Admin Kunci Sarjana
  MARKETING = 'MARKETING',
  FINANCE = 'FINANCE',
  OPERATOR = 'OPERATOR'
}

export enum ProgramType {
  REGULER = 'Reguler',
  KARYAWAN = 'Karyawan',
  REKOGNISI = 'RPL (Rekognisi)',
  ONLINE = 'Kuliah Online'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER' // Internal Transfer
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// --- ENTITIES ---

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  company_access: CompanyCode[]; // Can access PK, KS, or Both
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Student {
  id: string;
  // Core Identity
  full_name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  
  // Academic & Registration Details
  company: CompanyCode; // PK or KS client
  program_type: ProgramType;
  registration_date: string;
  university_target?: string;
  major_target?: string;
  
  // Specific Requirement Fields
  mother_name: string;
  blanko_number?: string; // No. Blanko Formulir
  resi_number?: string;   // No. Resi Pendaftaran
  
  // Status
  status: 'LEAD' | 'REGISTERED' | 'ACTIVE' | 'GRADUATED' | 'DROPOUT';
  sales_rep_id?: string; // Linked to User (Marketing)
}

export interface StudentFile {
  id: string;
  student_id: string;
  file_type: 'KTP' | 'KK' | 'IJAZAH' | 'TRANSKRIP' | 'SKRIPSI' | 'OTHER';
  file_url: string;
  uploaded_at: string;
  verified: boolean;
}

export interface BillingLog {
  id: string;
  student_id: string;
  invoice_number: string;
  
  // Amount Details
  total_bill: number;
  amount_paid: number;
  remaining_balance: number; // sisa_tagihan
  
  // Timing & Status
  due_date: string;
  paid_date?: string;
  
  // ERP Logic
  late_level: 0 | 1 | 2 | 3 | 4 | 5; // 0 = On Time, 5 = Severe Debt
  notes?: string;
}

export interface Transaction {
  id: string;
  company: CompanyCode; // Wallet Context (PK/KS)
  
  // Details
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string; // Chart of Account (COA) tag
  
  // Relations
  related_student_id?: string; // If tuition payment
  created_by: string; // User ID
  
  // Approval Workflow
  status: TransactionStatus;
  approved_by?: string;
  transaction_date: string;
  
  // Attachments
  proof_file_url?: string;
}

// --- UI STATE TYPES ---

export interface AppState {
  currentCompany: CompanyCode;
  isSidebarOpen: boolean;
  activeModule: 'DASHBOARD' | 'MARKETING' | 'ADMIN' | 'FINANCE' | 'SETTINGS';
}
