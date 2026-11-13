import express, { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, initDatabase, hashPassword, verifyPassword } from './server/db.ts';

dotenv.config();
initDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

app.use(express.json({ limit: '5mb' }));

interface DbUserRow {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  register_number: string;
  password_hash: string;
  department_id: string;
  department_name: string;
  designation: string | null;
  room: string | null;
  hostel_block: string | null;
  year: string | null;
  section: string | null;
  phone: string;
  avatar_url: string;
  parent_name: string | null;
  parent_phone: string | null;
  parent_otp_verified: number;
  mentor_id: string | null;
  mentor_name: string | null;
  active: number;
  cgpa: number | null;
  curfew_adherence: number | null;
  total_days_away: number | null;
  created_at: string;
}

interface AuthenticatedRequest extends Request {
  authUser?: ReturnType<typeof sanitizeUser>;
  authToken?: string;
}

function sanitizeUser(row: DbUserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    registerNumber: row.register_number,
    departmentId: row.department_id,
    departmentName: row.department_name,
    designation: row.designation || undefined,
    room: row.room || undefined,
    hostelBlock: row.hostel_block || undefined,
    year: row.year || undefined,
    section: row.section || undefined,
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    parentName: row.parent_name || undefined,
    parentPhone: row.parent_phone || undefined,
    parentOtpVerified: Boolean(row.parent_otp_verified),
    mentorId: row.mentor_id || undefined,
    mentorName: row.mentor_name || undefined,
    active: Boolean(row.active),
    cgpa: row.cgpa ?? undefined,
    curfewAdherence: row.curfew_adherence ?? undefined,
    totalDaysAway: row.total_days_away ?? 0,
  };
}

function sanitizeDepartment(row: any) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    hodId: row.hod_id,
    hodName: row.hod_name,
    studentCount: row.student_count,
    facultyCount: row.faculty_count,
  };
}

function sanitizeOutpass(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    registerNumber: row.register_number,
    departmentId: row.department_id,
    departmentName: row.department_name,
    yearSection: row.year_section,
    hostelInfo: row.hostel_info,
    roomNumber: row.room_number,
    avatarUrl: row.avatar_url || '',
    type: row.type,
    purpose: row.purpose,
    destinationAddress: row.destination_address,
    transitDetails: row.transit_details || undefined,
    departureTime: row.departure_time,
    expectedReturnTime: row.expected_return_time,
    actualReturnTime: row.actual_return_time || undefined,
    durationString: row.duration_string,
    isExtended: Boolean(row.is_extended),
    status: row.status,
    currentStage: row.current_stage,
    totalStages: row.total_stages,
    parentConsentVerified: Boolean(row.parent_consent_verified),
    parentPhone: row.parent_phone || '',
    parentName: row.parent_name || '',
    documents: JSON.parse(row.documents_json || '[]'),
    approvalSteps: JSON.parse(row.approval_steps_json || '[]'),
    hmacSignature: row.hmac_signature || undefined,
    rejectionReason: row.rejection_reason || undefined,
    rejectionStage: row.rejection_stage || undefined,
    rejectedBy: row.rejected_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeNotification(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    timestamp: row.timestamp,
    read: Boolean(row.read),
    linkOutpassId: row.link_outpass_id || undefined,
  };
}

function sanitizeAuditLog(row: any) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    entityName: row.entity_name,
    action: row.action,
    performedBy: row.performed_by,
    role: row.role,
    details: row.details,
    status: row.status,
  };
}

function parseTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [k, ...rest] = part.trim().split('=');
      if (k === 'dsu_session') {
        return decodeURIComponent(rest.join('='));
      }
    }
  }
  return null;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = parseTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const session = db.prepare('SELECT token, user_id, expires_at FROM sessions WHERE token = ?').get(token) as
    | { token: string; user_id: string; expires_at: string }
    | undefined;

  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    if (session) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
    return;
  }

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as DbUserRow | undefined;
  if (!userRow || !userRow.active) {
    res.status(401).json({ error: 'Account unavailable or deactivated.' });
    return;
  }

  req.authUser = sanitizeUser(userRow);
  req.authToken = token;
  next();
}

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dsu-smart-outpass' });
});

// Public: List academic departments for Student Registration dropdown
app.get('/api/departments', (_req, res) => {
  const rows = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
  res.json({ departments: rows.map(sanitizeDepartment) });
});

// Public: Student Account Registration
app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    registerNumber,
    name,
    departmentId,
    year,
    section,
    password,
    confirmPassword,
  } = req.body || {};

  const cleanReg = typeof registerNumber === 'string' ? registerNumber.trim().toUpperCase() : '';
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanDeptId = typeof departmentId === 'string' ? departmentId.trim() : '';
  const cleanYear = typeof year === 'string' ? year.trim() : '';
  const cleanSection = typeof section === 'string' ? section.trim() : '';
  const cleanPassword = typeof password === 'string' ? password : '';
  const cleanConfirm = typeof confirmPassword === 'string' ? confirmPassword : '';

  if (!cleanReg || !cleanName || !cleanDeptId || !cleanYear || !cleanSection || !cleanPassword || !cleanConfirm) {
    res.status(400).json({ error: 'All registration fields are required.' });
    return;
  }

  if (!/^[A-Z0-9-]{4,24}$/i.test(cleanReg)) {
    res.status(400).json({ error: 'Register Number must be 4–24 alphanumeric characters.' });
    return;
  }

  if (cleanPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  if (cleanPassword !== cleanConfirm) {
    res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    return;
  }

  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(cleanDeptId) as any;
  if (!dept) {
    res.status(400).json({ error: 'Selected department does not exist.' });
    return;
  }

  const existing = db
    .prepare('SELECT id FROM users WHERE LOWER(register_number) = LOWER(?)')
    .get(cleanReg) as { id: string } | undefined;

  if (existing) {
    res.status(409).json({ error: `Register Number ${cleanReg} is already registered. Please sign in.` });
    return;
  }

  const studentId = `student-${crypto.randomUUID()}`;
  const institutionalEmail = `${cleanReg.toLowerCase()}@student.dsuniversity.ac.in`;
  const passwordHash = hashPassword(cleanPassword);
  const nowIso = new Date().toISOString();
  const nowDisplay = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

  db.prepare(`
    INSERT INTO users (
      id, name, email, role, register_number, password_hash,
      department_id, department_name, year, section,
      room, hostel_block, phone, avatar_url,
      parent_name, parent_phone, parent_otp_verified,
      mentor_id, mentor_name, active, total_days_away, created_at
    ) VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, '', '', '', '', '', '', 1, 'user-fac-sivaselvi', 'Sivaselvi (AP/CYS)', 1, 0, ?)
  `).run(
    studentId,
    cleanName,
    institutionalEmail,
    cleanReg,
    passwordHash,
    dept.id,
    dept.name,
    cleanYear,
    cleanSection,
    nowIso
  );

  // Increment registered student count in department
  db.prepare('UPDATE departments SET student_count = student_count + 1 WHERE id = ?').run(dept.id);

  // Audit Log entry
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, entity_name, action, performed_by, role, details, status, created_at)
    VALUES (?, ?, ?, 'Student Registered', ?, 'Student', ?, 'Enrolled', ?)
  `).run(
    `audit-${crypto.randomUUID()}`,
    nowDisplay,
    `Student Account ${cleanReg}`,
    cleanName,
    `Registered in ${dept.name} (${cleanYear} • ${cleanSection})`,
    nowIso
  );

  const createdRow = db.prepare('SELECT * FROM users WHERE id = ?').get(studentId) as DbUserRow;
  res.status(201).json({
    message: 'Student account created successfully! Please sign in with your Register Number and Password.',
    student: sanitizeUser(createdRow),
  });
});

// Public: Login (Strict DB credential + password hash verification)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, portalType } = req.body || {};
  const cleanId = typeof identifier === 'string' ? identifier.trim() : '';
  const cleanPass = typeof password === 'string' ? password : '';
  const portal = portalType === 'staff' ? 'staff' : 'student';

  if (!cleanId || !cleanPass) {
    res.status(400).json({ error: 'Please enter both Register Number / ID and Password.' });
    return;
  }

  let userRow: DbUserRow | undefined;

  if (portal === 'student') {
    // Student Login: strictly match registered student by Register Number and verify hashed password
    userRow = db
      .prepare("SELECT * FROM users WHERE LOWER(register_number) = LOWER(?) AND role = 'student'")
      .get(cleanId) as DbUserRow | undefined;
  } else {
    // Staff Login: Faculty, HOD, or Associate Dean/Admin by official email or staff ID
    userRow = db
      .prepare(
        "SELECT * FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(register_number) = LOWER(?)) AND role IN ('faculty', 'hod', 'admin')"
      )
      .get(cleanId, cleanId) as DbUserRow | undefined;
  }

  if (!userRow || !verifyPassword(cleanPass, userRow.password_hash)) {
    res.status(401).json({
      error:
        portal === 'student'
          ? 'Invalid Register Number or Password. Registered students only.'
          : 'Invalid Institutional Email / Staff ID or Password.',
    });
    return;
  }

  if (!userRow.active) {
    res.status(403).json({ error: 'This account has been deactivated by administration.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    userRow.id,
    nowIso,
    expiresIso
  );

  res.cookie('dsu_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });

  res.json({
    token,
    user: sanitizeUser(userRow),
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = parseTokenFromRequest(req);
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.clearCookie('dsu_session', { path: '/' });
  res.json({ ok: true });
});

// Role-scoped Bootstrap Data for Authenticated User
app.get('/api/bootstrap', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  const departmentRows = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
  const departments = departmentRows.map(sanitizeDepartment);

  if (user.role === 'student') {
    // Strict student data isolation: student sees ONLY their own profile, own outpasses, own notifications
    const outpassRows = db
      .prepare('SELECT * FROM outpasses WHERE student_id = ? ORDER BY created_at DESC')
      .all(user.id);
    const notifRows = db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.id);

    res.json({
      currentUser: user,
      users: [user],
      departments,
      outpasses: outpassRows.map(sanitizeOutpass),
      notifications: notifRows.map(sanitizeNotification),
      auditLogs: [],
    });
    return;
  }

  if (user.role === 'faculty' || user.role === 'hod') {
    // Institutional Faculty / HOD sees registered students & outpasses relevant to their oversight
    const studentRows = db
      .prepare("SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC")
      .all() as unknown as DbUserRow[];
    const outpassRows = db.prepare('SELECT * FROM outpasses ORDER BY created_at DESC').all();
    const notifRows = db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.id);

    res.json({
      currentUser: user,
      users: [user, ...studentRows.map(sanitizeUser)],
      departments,
      outpasses: outpassRows.map(sanitizeOutpass),
      notifications: notifRows.map(sanitizeNotification),
      auditLogs: [],
    });
    return;
  }

  // Admin / Associate Dean
  const allUserRows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as unknown as DbUserRow[];
  const allOutpasses = db.prepare('SELECT * FROM outpasses ORDER BY created_at DESC').all();
  const allNotifs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
  const allLogs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC').all();

  res.json({
    currentUser: user,
    users: allUserRows.map(sanitizeUser),
    departments,
    outpasses: allOutpasses.map(sanitizeOutpass),
    notifications: allNotifs.map(sanitizeNotification),
    auditLogs: allLogs.map(sanitizeAuditLog),
  });
});

// Update Authenticated Student Contact & Hostel Info
app.patch('/api/profile/contact', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  const { phone, parentName, parentPhone, hostelBlock, room } = req.body || {};

  db.prepare(`
    UPDATE users
    SET phone = ?, parent_name = ?, parent_phone = ?, hostel_block = ?, room = ?
    WHERE id = ?
  `).run(
    typeof phone === 'string' ? phone.trim() : user.phone || '',
    typeof parentName === 'string' ? parentName.trim() : user.parentName || '',
    typeof parentPhone === 'string' ? parentPhone.trim() : user.parentPhone || '',
    typeof hostelBlock === 'string' ? hostelBlock.trim() : user.hostelBlock || '',
    typeof room === 'string' ? room.trim() : user.room || '',
    user.id
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as DbUserRow;
  res.json({ user: sanitizeUser(updated) });
});

// Change Password
app.patch('/api/profile/password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  const { currentPassword, newPassword, confirmPassword } = req.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400).json({ error: 'All password fields are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New passwords do not match.' });
    return;
  }

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as DbUserRow;
  if (!verifyPassword(currentPassword, row.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
  res.json({ message: 'Password updated successfully.' });
});

// Student: Apply for Outpass
app.post('/api/outpasses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  if (user.role !== 'student') {
    res.status(403).json({ error: 'Only registered students can submit outpass applications.' });
    return;
  }

  const { type, destinationAddress, purpose, departureTime, expectedReturnTime, documents } = req.body || {};

  if (!type || !destinationAddress?.trim() || !purpose?.trim() || !departureTime || !expectedReturnTime) {
    res.status(400).json({ error: 'Please complete all required outpass details.' });
    return;
  }

  const dep = new Date(departureTime);
  const ret = new Date(expectedReturnTime);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(ret.getTime()) || ret.getTime() <= dep.getTime()) {
    res.status(400).json({ error: 'Expected return time must be after departure time.' });
    return;
  }

  const diffHours = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 60 * 60)));
  const days = Math.floor(diffHours / 24);
  const hours = diffHours % 24;
  const durationString = days > 0 ? `${days} Days, ${hours} Hours (${diffHours}h)` : `${hours} Hours`;
  const isExtended = diffHours > 48;

  const newId = `OP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const nowIso = new Date().toISOString();
  const nowDisplay = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

  const approvalSteps = [
    {
      stage: 1,
      roleName: 'Student Submission',
      approverName: `${user.name} (Student)`,
      status: 'approved',
      timestamp: nowDisplay,
      remarks: 'Submitted via Student Residency Portal.',
    },
    {
      stage: 2,
      roleName: 'Faculty Mentor Review',
      approverName: user.mentorName || 'Sivaselvi (AP/CYS)',
      status: 'pending',
    },
    ...(isExtended
      ? [
          { stage: 3, roleName: 'HOD Approval', approverName: 'Dr. Ravindra Krishna', status: 'pending' },
          { stage: 4, roleName: 'Associate Dean Sanction', approverName: 'Dr. Shankar', status: 'pending' },
        ]
      : []),
    {
      stage: isExtended ? 5 : 3,
      roleName: 'Turnstile QR Tokenization',
      approverName: 'Main Gate Terminal',
      status: 'pending',
    },
  ];

  const yearSection = `${user.year || 'N/A'} • ${user.section || 'N/A'}`;
  const hostelInfo = user.hostelBlock || 'Campus Residential Hostel';
  const roomNumber = user.room || 'Resident';

  db.prepare(`
    INSERT INTO outpasses (
      id, student_id, student_name, register_number, department_id, department_name,
      year_section, hostel_info, room_number, avatar_url,
      type, purpose, destination_address, departure_time, expected_return_time,
      duration_string, is_extended, status, current_stage, total_stages,
      parent_consent_verified, parent_phone, parent_name, documents_json, approval_steps_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'Pending Mentor', 2, ?, 1, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    user.id,
    user.name,
    user.registerNumber,
    user.departmentId,
    user.departmentName,
    yearSection,
    hostelInfo,
    roomNumber,
    type,
    purpose.trim(),
    destinationAddress.trim(),
    departureTime,
    expectedReturnTime,
    durationString,
    isExtended ? 1 : 0,
    isExtended ? 5 : 3,
    user.parentPhone || '',
    user.parentName || '',
    JSON.stringify(Array.isArray(documents) ? documents : []),
    JSON.stringify(approvalSteps),
    nowIso,
    nowIso
  );

  // Notify Faculty Mentor
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
    VALUES (?, ?, 'New Outpass Application', ?, 'info', 'Just now', 0, ?, ?)
  `).run(
    `notif-${crypto.randomUUID()}`,
    user.mentorId || 'user-fac-sivaselvi',
    `${user.name} (${user.registerNumber}) submitted a ${type} request.`,
    newId,
    nowIso
  );

  // Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, entity_name, action, performed_by, role, details, status, created_at)
    VALUES (?, ?, ?, 'Submission Created', ?, 'Student', ?, 'Verified', ?)
  `).run(
    `audit-${crypto.randomUUID()}`,
    nowDisplay,
    `Outpass Application #${newId}`,
    user.name,
    `${type} destination: ${destinationAddress.trim().slice(0, 40)} • Duration: ${durationString}`,
    nowIso
  );

  const created = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(newId);
  res.status(201).json({ outpass: sanitizeOutpass(created) });
});

// Staff: Approve Outpass
app.post('/api/outpasses/:id/approve', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  if (user.role === 'student') {
    res.status(403).json({ error: 'Students cannot approve outpasses.' });
    return;
  }

  const outpassId = req.params.id;
  const remarks = typeof req.body?.remarks === 'string' ? req.body.remarks.trim() : '';
  const row = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(outpassId) as any;

  if (!row) {
    res.status(404).json({ error: 'Outpass application not found.' });
    return;
  }

  const nowIso = new Date().toISOString();
  const nowDisplay = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
  const steps: any[] = JSON.parse(row.approval_steps_json || '[]');
  let nextStatus = row.status;
  let nextStage = row.current_stage;

  if (user.role === 'faculty') {
    const idx = steps.findIndex(s => s.roleName.includes('Mentor'));
    if (idx !== -1) {
      steps[idx] = {
        ...steps[idx],
        status: 'approved',
        approverName: `${user.name} (AP/CYS)`,
        timestamp: nowDisplay,
        remarks: remarks || 'Academic attendance verified. Stage 1 cleared.',
        signature: `HMAC-SHA256-${crypto.randomBytes(3).toString('hex')}`,
      };
    }
    if (row.is_extended) {
      nextStatus = 'Pending HOD';
      nextStage = 3;
      // Notify HOD
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
        VALUES (?, 'user-hod-cys', 'Pending HOD Clearance', ?, 'alert', 'Just now', 0, ?, ?)
      `).run(
        `notif-${crypto.randomUUID()}`,
        `Outpass #${outpassId} for ${row.student_name} (${row.register_number}) forwarded for HOD review.`,
        outpassId,
        nowIso
      );
    } else {
      nextStatus = 'Approved';
      nextStage = row.total_stages;
      const qrIdx = steps.findIndex(s => s.roleName.includes('Turnstile') || s.roleName.includes('QR'));
      if (qrIdx !== -1) {
        steps[qrIdx] = { ...steps[qrIdx], status: 'approved', timestamp: nowDisplay };
      }
    }
  } else if (user.role === 'hod') {
    const idx = steps.findIndex(s => s.roleName.includes('HOD'));
    if (idx !== -1) {
      steps[idx] = {
        ...steps[idx],
        status: 'approved',
        approverName: user.name,
        timestamp: nowDisplay,
        remarks: remarks || 'Department records validated. Forwarded to Associate Dean.',
        signature: `HOD-SHA256-${crypto.randomBytes(3).toString('hex')}`,
      };
    }
    nextStatus = 'Pending Dean/Admin';
    nextStage = 4;
    // Notify Associate Dean
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
      VALUES (?, 'user-admin-shankar', 'Final Sanction Queue', ?, 'info', 'Just now', 0, ?, ?)
    `).run(
      `notif-${crypto.randomUUID()}`,
      `Outpass #${outpassId} for ${row.student_name} (${row.register_number}) endorsed by HOD and ready for Dean sanction.`,
      outpassId,
      nowIso
    );
  } else if (user.role === 'admin') {
    const idx = steps.findIndex(s => s.roleName.includes('Dean') || s.roleName.includes('Admin'));
    if (idx !== -1) {
      steps[idx] = {
        ...steps[idx],
        status: 'approved',
        approverName: user.name,
        timestamp: nowDisplay,
        remarks: remarks || 'College administrative sanction granted. Turnstile active.',
        signature: `DEAN-FINAL-${crypto.randomBytes(3).toString('hex')}`,
      };
    }
    const qrIdx = steps.findIndex(s => s.roleName.includes('Turnstile') || s.roleName.includes('QR'));
    if (qrIdx !== -1) {
      steps[qrIdx] = { ...steps[qrIdx], status: 'approved', timestamp: nowDisplay };
    }
    nextStatus = 'Approved';
    nextStage = row.total_stages;
  }

  const hmacSig = `SHA256:${crypto.randomBytes(8).toString('hex')}`;
  db.prepare(`
    UPDATE outpasses
    SET status = ?, current_stage = ?, approval_steps_json = ?, hmac_signature = ?, updated_at = ?
    WHERE id = ?
  `).run(nextStatus, nextStage, JSON.stringify(steps), hmacSig, nowIso, outpassId);

  // Notify student
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
    VALUES (?, ?, ?, ?, 'approval', 'Just now', 0, ?, ?)
  `).run(
    `notif-${crypto.randomUUID()}`,
    row.student_id,
    `Outpass #${outpassId} Updated`,
    `${user.role.toUpperCase()} ${user.name} endorsed your outpass request. Current status: ${nextStatus}.`,
    outpassId,
    nowIso
  );

  // Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, entity_name, action, performed_by, role, details, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Authorized', ?)
  `).run(
    `audit-${crypto.randomUUID()}`,
    nowDisplay,
    `Outpass #${outpassId}`,
    `Approved by ${user.role.toUpperCase()}`,
    user.name,
    user.role,
    remarks || `Endorsement issued for ${row.student_name} (${row.register_number})`,
    nowIso
  );

  const updated = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(outpassId);
  res.json({ outpass: sanitizeOutpass(updated) });
});

// Staff: Reject Outpass
app.post('/api/outpasses/:id/reject', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  if (user.role === 'student') {
    res.status(403).json({ error: 'Students cannot reject outpasses.' });
    return;
  }

  const outpassId = req.params.id;
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!reason) {
    res.status(400).json({ error: 'Rejection reason is required.' });
    return;
  }

  const row = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(outpassId) as any;
  if (!row) {
    res.status(404).json({ error: 'Outpass application not found.' });
    return;
  }

  const nowIso = new Date().toISOString();
  const nowDisplay = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
  const steps: any[] = JSON.parse(row.approval_steps_json || '[]').map((step: any) => {
    if (
      (user.role === 'faculty' && step.roleName.includes('Mentor')) ||
      (user.role === 'hod' && step.roleName.includes('HOD')) ||
      (user.role === 'admin' && (step.roleName.includes('Dean') || step.roleName.includes('Admin')))
    ) {
      return {
        ...step,
        status: 'rejected',
        approverName: user.name,
        timestamp: nowDisplay,
        remarks: reason,
      };
    }
    return step;
  });

  db.prepare(`
    UPDATE outpasses
    SET status = 'Rejected', rejection_reason = ?, rejection_stage = ?, rejected_by = ?, approval_steps_json = ?, updated_at = ?
    WHERE id = ?
  `).run(reason, `${user.role.toUpperCase()} Evaluation`, user.name, JSON.stringify(steps), nowIso, outpassId);

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
    VALUES (?, ?, ?, ?, 'rejection', 'Just now', 0, ?, ?)
  `).run(
    `notif-${crypto.randomUUID()}`,
    row.student_id,
    `Outpass #${outpassId} Rejected`,
    `Your application was rejected by ${user.name}. Reason: "${reason}"`,
    outpassId,
    nowIso
  );

  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, entity_name, action, performed_by, role, details, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Flagged', ?)
  `).run(
    `audit-${crypto.randomUUID()}`,
    nowDisplay,
    `Outpass #${outpassId}`,
    `Rejected by ${user.role.toUpperCase()}`,
    user.name,
    user.role,
    `Reason: ${reason}`,
    nowIso
  );

  const updated = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(outpassId);
  res.json({ outpass: sanitizeOutpass(updated) });
});

// Staff: Request Clarification
app.post('/api/outpasses/:id/request-info', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser!;
  if (user.role === 'student') {
    res.status(403).json({ error: 'Unauthorized action.' });
    return;
  }

  const outpassId = req.params.id;
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  const row = db.prepare('SELECT * FROM outpasses WHERE id = ?').get(outpassId) as any;

  if (!row || !query) {
    res.status(400).json({ error: 'Outpass or query missing.' });
    return;
  }

  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, timestamp, read, link_outpass_id, created_at)
    VALUES (?, ?, ?, ?, 'alert', 'Just now', 0, ?, ?)
  `).run(
    `notif-${crypto.randomUUID()}`,
    row.student_id,
    `Clarification Requested for #${outpassId}`,
    `${user.name} requested information: "${query}"`,
    outpassId,
    nowIso
  );

  res.json({ ok: true });
});

// Notifications read state
app.patch('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.authUser!.id);
  res.json({ ok: true });
});

app.patch('/api/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.authUser!.role === 'admin') {
    db.prepare('UPDATE notifications SET read = 1').run();
  } else {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.authUser!.id);
  }
  res.json({ ok: true });
});

// Admin-only routes
app.patch('/api/admin/users/:id/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.authUser!.role !== 'admin') {
    res.status(403).json({ error: 'Admin authorization required.' });
    return;
  }
  db.prepare('UPDATE users SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.patch('/api/admin/users/:id/role', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.authUser!.role !== 'admin') {
    res.status(403).json({ error: 'Admin authorization required.' });
    return;
  }
  const newRole = req.body?.role;
  if (!['student', 'faculty', 'hod', 'admin'].includes(newRole)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, req.params.id);
  res.json({ ok: true });
});

app.post('/api/admin/departments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.authUser!.role !== 'admin') {
    res.status(403).json({ error: 'Admin authorization required.' });
    return;
  }
  const { code, name, hodId, hodName } = req.body || {};
  if (!code?.trim() || !name?.trim()) {
    res.status(400).json({ error: 'Department code and name are required.' });
    return;
  }
  const id = `dept-${code.trim().toLowerCase()}`;
  db.prepare(`
    INSERT OR IGNORE INTO departments (id, code, name, hod_id, hod_name, student_count, faculty_count)
    VALUES (?, ?, ?, ?, ?, 0, 0)
  `).run(id, code.trim().toUpperCase(), name.trim(), hodId || 'user-hod-cys', hodName || 'Assigned HOD');
  const created = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
  res.status(201).json({ department: sanitizeDepartment(created) });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DSU Smart Outpass server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
