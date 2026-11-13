import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'smart_outpass.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for reliable concurrent reads/writes
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  try {
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      hod_id TEXT NOT NULL,
      hod_name TEXT NOT NULL,
      student_count INTEGER NOT NULL DEFAULT 0,
      faculty_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'hod', 'admin')),
      register_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      department_id TEXT NOT NULL,
      department_name TEXT NOT NULL,
      designation TEXT,
      room TEXT,
      hostel_block TEXT,
      year TEXT,
      section TEXT,
      phone TEXT NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL DEFAULT '',
      parent_name TEXT,
      parent_phone TEXT,
      parent_otp_verified INTEGER NOT NULL DEFAULT 1,
      mentor_id TEXT,
      mentor_name TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      cgpa REAL,
      curfew_adherence REAL,
      total_days_away REAL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS outpasses (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      register_number TEXT NOT NULL,
      department_id TEXT NOT NULL,
      department_name TEXT NOT NULL,
      year_section TEXT NOT NULL,
      hostel_info TEXT NOT NULL,
      room_number TEXT NOT NULL,
      avatar_url TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      transit_details TEXT,
      departure_time TEXT NOT NULL,
      expected_return_time TEXT NOT NULL,
      actual_return_time TEXT,
      duration_string TEXT NOT NULL,
      is_extended INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      current_stage INTEGER NOT NULL,
      total_stages INTEGER NOT NULL,
      parent_consent_verified INTEGER NOT NULL DEFAULT 1,
      parent_phone TEXT NOT NULL DEFAULT '',
      parent_name TEXT NOT NULL DEFAULT '',
      documents_json TEXT NOT NULL DEFAULT '[]',
      approval_steps_json TEXT NOT NULL DEFAULT '[]',
      hmac_signature TEXT,
      rejection_reason TEXT,
      rejection_stage TEXT,
      rejected_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      link_outpass_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      entity_name TEXT NOT NULL,
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      role TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Clean out any legacy demo students or removed faculty roles if ever seeded previously
  const removedUserIds = [
    'user-student-surya',
    'user-student-sneha',
    'user-student-karthik',
    'user-student-rohan',
    'user-fac-mehra',
  ];
  const deleteOutpassesByStudent = db.prepare('DELETE FROM outpasses WHERE student_id = ?');
  const deleteNotifsByUser = db.prepare('DELETE FROM notifications WHERE user_id = ?');
  const deleteSessionsByUser = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');

  for (const uid of removedUserIds) {
    deleteOutpassesByStudent.run(uid);
    deleteNotifsByUser.run(uid);
    deleteSessionsByUser.run(uid);
    deleteUser.run(uid);
  }

  // Seed academic departments
  const initialDepartments = [
    { id: 'dept-cys', code: 'CYS', name: 'Cyber Security (CYS)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 1 },
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering (CSE)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication Engineering (ECE)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
    { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering (MECH)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
    { id: 'dept-civil', code: 'CIVIL', name: 'Civil Engineering (CIVIL)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
    { id: 'dept-eee', code: 'EEE', name: 'Electrical & Electronics Engineering (EEE)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
    { id: 'dept-biotech', code: 'BIOTECH', name: 'Biotechnology & Bioinformatics (BIOTECH)', hod_id: 'user-hod-cys', hod_name: 'Dr. Ravindra Krishna', student_count: 0, faculty_count: 0 },
  ];

  const insertDept = db.prepare(`
    INSERT OR IGNORE INTO departments (id, code, name, hod_id, hod_name, student_count, faculty_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const d of initialDepartments) {
    insertDept.run(d.id, d.code, d.name, d.hod_id, d.hod_name, d.student_count, d.faculty_count);
  }

  // Seed ONLY the three institutional staff accounts (Faculty Sivaselvi, HOD Dr. Ravindra Krishna, Associate Dean Dr. Shankar)
  // ZERO demo student accounts are seeded.
  const now = new Date().toISOString();
  const staffAccounts = [
    {
      id: 'user-fac-sivaselvi',
      name: 'Sivaselvi',
      email: 'sivaselvi@dsuniversity.ac.in',
      role: 'faculty',
      register_number: 'FAC-8842',
      password_hash: hashPassword('staff123'),
      department_id: 'dept-cys',
      department_name: 'Cyber Security (CYS)',
      designation: 'Assistant Professor (AP/CYS) & Faculty Mentor',
      room: 'Cabin #204, Cyber Security Block',
      phone: '+91 94441-23456',
    },
    {
      id: 'user-hod-cys',
      name: 'Dr. Ravindra Krishna',
      email: 'ravindra.krishna@dsuniversity.ac.in',
      role: 'hod',
      register_number: 'HOD-CYS-01',
      password_hash: hashPassword('staff123'),
      department_id: 'dept-cys',
      department_name: 'Cyber Security (CYS)',
      designation: 'Professor & Head of Department (HOD/CYS)',
      room: 'HOD Suite, Cyber Security Block',
      phone: '+91 94432-88771',
    },
    {
      id: 'user-admin-shankar',
      name: 'Dr. Shankar',
      email: 'shankar@dsuniversity.ac.in',
      role: 'admin',
      register_number: 'DEAN-ADMIN-01',
      password_hash: hashPassword('staff123'),
      department_id: 'dept-cys',
      department_name: 'Institutional Administration & Student Affairs',
      designation: 'Associate Dean (Student Affairs & Institutional Life)',
      room: 'Dean Office, Administrative Quadrangle',
      phone: '+91 94440-11223',
    },
  ];

  const insertStaff = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, name, email, role, register_number, password_hash,
      department_id, department_name, designation, room, phone, avatar_url, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, ?)
  `);

  for (const s of staffAccounts) {
    insertStaff.run(
      s.id,
      s.name,
      s.email,
      s.role,
      s.register_number,
      s.password_hash,
      s.department_id,
      s.department_name,
      s.designation,
      s.room,
      s.phone,
      now
    );
  }
}
