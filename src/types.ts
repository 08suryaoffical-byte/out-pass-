// Types and Schema for Smart Outpass Management System

export type UserRole = 'student' | 'faculty' | 'hod' | 'admin';

export type OutpassType = 'Home Visit' | 'Local Day Out' | 'Emergency Medical' | 'Official Duty' | 'Hackathon/Project';

export type OutpassStatus = 
  | 'Pending Mentor' 
  | 'Pending HOD' 
  | 'Pending Dean/Admin' 
  | 'Approved' 
  | 'Rejected' 
  | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registerNumber?: string;
  departmentId: string;
  departmentName: string;
  designation?: string;
  room?: string;
  hostelBlock?: string;
  year?: string;
  section?: string;
  phone: string;
  avatarUrl: string;
  parentName?: string;
  parentPhone?: string;
  parentOtpVerified?: boolean;
  mentorId?: string;
  mentorName?: string;
  active: boolean;
  cgpa?: number;
  curfewAdherence?: number;
  totalDaysAway?: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodId: string;
  hodName: string;
  studentCount: number;
  facultyCount: number;
}

export interface ApprovalStep {
  stage: number;
  roleName: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  timestamp?: string;
  remarks?: string;
  signature?: string;
}

export interface OutpassApplication {
  id: string; // e.g. OP-2025-0842
  studentId: string;
  studentName: string;
  registerNumber: string;
  departmentId: string;
  departmentName: string;
  yearSection: string;
  hostelInfo: string;
  roomNumber: string;
  avatarUrl: string;
  type: OutpassType;
  purpose: string;
  destinationAddress: string;
  transitDetails?: string;
  departureTime: string; // ISO date-time or formatted
  expectedReturnTime: string;
  actualReturnTime?: string;
  durationString: string;
  isExtended: boolean; // > 48 hours requires HOD & Dean approval
  status: OutpassStatus;
  currentStage: number; // 1: Mentor, 2: HOD, 3: Dean/Admin, 4: QR Active, 5: Completed
  totalStages: number;
  parentConsentVerified: boolean;
  parentPhone: string;
  parentName: string;
  documents: {
    name: string;
    size: string;
    type: 'pdf' | 'image';
    url?: string;
    verified?: boolean;
  }[];
  approvalSteps: ApprovalStep[];
  hmacSignature?: string;
  rejectionReason?: string;
  rejectionStage?: string;
  rejectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'alert' | 'info';
  timestamp: string;
  read: boolean;
  linkOutpassId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entityName: string;
  action: string;
  performedBy: string;
  role: string;
  details: string;
  status: 'Verified' | 'Authorized' | 'Enrolled' | 'Flagged';
}
