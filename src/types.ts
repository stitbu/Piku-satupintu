
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  PARTNER = 'PARTNER'
}

export enum DivisionType {
  DIRECTORS = 'Direksi',
  HR = 'SDM & Personalia',
  MARKETING = 'Marketing',
  ADMIN = 'Administrasi',
  FINANCE = 'Keuangan',
  IT_SUPPORT = 'IT Support',
  GA_SECURITY = 'Kebersihan & Keamanan',
  PARTNERS = 'Mitra Kampus'
}

export enum ToolCategory {
  DAILY = 'Daily Tools',
  SHARED = 'Shared Tools',
  PROJECT = 'Project & Drafts'
}

export type LanguageCode = 'id' | 'en';

export interface Tool {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  category: ToolCategory;
  divisionId?: DivisionType;
  isPersonal?: boolean;
  isArchived?: boolean;
  deletedAt?: number;
  isLocked?: boolean;
  color?: string;
  lastAccessed?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  relatedToolIds: string[];
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  assigneeId?: string;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDate?: string;
  originDivisionId?: DivisionType;
  targetDivisionId?: DivisionType;
  timestamp?: number;
  reminderAt?: number;
  isReminded?: boolean;
  attachmentUrl?: string;
  subtasks?: Subtask[];
}

export interface DivisionData {
  id: DivisionType;
  name: string;
  description: string;
  icon: string;
  workflow: WorkflowStep[];
  tasks: Task[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  division: DivisionType;
  stickyNote: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  channelId: string;
  content: string;
  timestamp: number;
}

export interface ChatGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: number;
  isPublic?: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  soundEnabled: boolean;
  language: LanguageCode;
  whatsappNumber?: string;
  autoSendWa?: boolean;
  webhookUrl?: string;
  fonnteToken?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime: number;
  checkOutTime?: number;
  location: 'WFO' | 'WFH';
  notes?: string;
  latitude?: number;
  longitude?: number;
  mood?: string;
}

export interface AttendanceConfig {
  workStartTime: string;
  workEndTime: string;
  gracePeriodMinutes: number;
  workDays: number[];
  annualLeaveQuota: number;
  officeLat?: number;
  officeLng?: number;
  allowedRadiusMeters?: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}

export interface SystemBackup {
  version: string;
  timestamp: number;
  tools: Tool[];
  announcements: Announcement[];
  attendanceConfig: AttendanceConfig;
  holidays: Holiday[];
  users?: User[];
}

// --- MARKETING MODULE TYPES ---
export interface MarketingLead {
    id: string;
    name: string;
    phone: string;
    source: string;
    status: 'NEW' | 'FOLLOW_UP' | 'CLOSING';
    notes?: string;
    date: string;
    hotScore?: number;
    scoreReason?: string;
}

// --- FINANCE MODULE TYPES ---
export type CompanyCode = 'PK' | 'KS';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Transaction {
  id: string;
  company: CompanyCode;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  related_student_id?: string;
  created_by: string;
  status: TransactionStatus;
  approved_by?: string;
  transaction_date: string;
  proof_file_url?: string;
}

// --- ADMIN / ADMISSION TYPES ---
export enum ProgramType {
  REGULER = 'Reguler',
  KARYAWAN = 'Karyawan',
  REKOGNISI = 'RPL (Rekognisi)',
  ONLINE = 'Kuliah Online'
}

export interface BillingLog {
  id: string;
  student_id: string;
  invoice_number: string;
  total_bill: number;
  amount_paid: number;
  remaining_balance: number;
  due_date: string;
  paid_date?: string;
  late_level: 0 | 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface Student {
  id: string;
  full_name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  company: CompanyCode;
  program_type: ProgramType;
  registration_date: string;
  university_target?: string;
  major_target?: string;
  mother_name: string;
  blanko_number?: string;
  resi_number?: string;
  status: 'LEAD' | 'REGISTERED' | 'ACTIVE' | 'GRADUATED' | 'DROPOUT';
  sales_rep_id?: string;
  billing?: BillingLog; // Joined data
}

// --- DOCUMENT MODULE TYPES ---
export interface DocItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  size?: string;
  updatedAt: string;
  accessLevel: 'public' | 'restricted';
  ownerDivision: DivisionType;
}

// --- ASSET/INVENTORY MODULE TYPES ---
export interface AssetItem {
  id: string;
  code: string;
  name: string;
  category: string;
  condition: string;
  location: string;
  purchaseDate: string;
}

// --- LEGACY FINANCE TYPES (For FinanceView component) ---
export interface FinanceTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  requesterId: string;
  divisionId: DivisionType;
}
