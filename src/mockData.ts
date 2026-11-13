import { User, Department, OutpassApplication, AuditLog, NotificationItem } from './types';

// Demo student data, sample student accounts, and removed roles (Sneha Reddy, Karthik, Dr. P. Mehra)
// have been permanently removed. All data is loaded dynamically from the persistent SQLite database.
export const INITIAL_DEPARTMENTS: Department[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_OUTPASSES: OutpassApplication[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
