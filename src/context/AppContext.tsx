import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Department, OutpassApplication, NotificationItem, AuditLog } from '../types';

const TOKEN_STORAGE_KEY = 'dsu_auth_token';

export interface StudentRegisterInput {
  registerNumber: string;
  name: string;
  departmentId: string;
  year: string;
  section: string;
  password: string;
  confirmPassword: string;
}

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  users: User[];
  departments: Department[];
  outpasses: OutpassApplication[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  isLoadingAuth: boolean;
  registerStudent: (data: StudentRegisterInput) => Promise<{ ok: boolean; message?: string; error?: string }>;
  login: (identifier: string, password: string, portalType?: 'student' | 'staff') => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  // Outpass operations
  applyOutpass: (data: {
    type: OutpassApplication['type'];
    destinationAddress: string;
    purpose: string;
    departureTime: string;
    expectedReturnTime: string;
    documents?: { name: string; size: string; type: 'pdf' | 'image' }[];
  }) => Promise<string>;
  approveOutpass: (outpassId: string, remarks?: string) => Promise<void>;
  rejectOutpass: (outpassId: string, reason: string) => Promise<void>;
  requestInfo: (outpassId: string, query: string) => Promise<void>;
  updateContact: (data: {
    phone: string;
    parentName: string;
    parentPhone: string;
    hostelBlock?: string;
    room?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ ok: boolean; message?: string; error?: string }>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  // Admin CRUD
  toggleUserStatus: (userId: string) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  activeOutpassFilter: string;
  setActiveOutpassFilter: (f: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [outpasses, setOutpasses] = useState<OutpassApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeOutpassFilter, setActiveOutpassFilter] = useState('ALL');

  const currentRole = currentUser?.role || null;

  const loadDepartments = useCallback(async () => {
    const res = await apiFetch('/api/departments');
    if (res.ok && Array.isArray(res.data.departments)) {
      setDepartments(res.data.departments);
    }
  }, []);

  const refreshData = useCallback(async () => {
    const res = await apiFetch('/api/bootstrap');
    if (res.ok && res.data.currentUser) {
      setCurrentUser(res.data.currentUser);
      setUsers(res.data.users || []);
      setDepartments(res.data.departments || []);
      setOutpasses(res.data.outpasses || []);
      setNotifications(res.data.notifications || []);
      setAuditLogs(res.data.auditLogs || []);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setCurrentUser(null);
      setUsers([]);
      setOutpasses([]);
      setNotifications([]);
      setAuditLogs([]);
      await loadDepartments();
    }
  }, [loadDepartments]);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        await refreshData();
      } else {
        await loadDepartments();
      }
      if (active) setIsLoadingAuth(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshData, loadDepartments]);

  const registerStudent = async (data: StudentRegisterInput) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { ok: false, error: res.data.error || 'Registration failed.' };
    }
    return {
      ok: true,
      message: res.data.message || 'Account created successfully! Please sign in.',
    };
  };

  const login = async (
    identifier: string,
    password: string,
    portalType: 'student' | 'staff' = 'student'
  ) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, portalType }),
    });
    if (!res.ok) {
      return { ok: false, error: res.data.error || 'Authentication failed.' };
    }
    if (res.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
    }
    await refreshData();
    return { ok: true };
  };

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setCurrentUser(null);
    setUsers([]);
    setOutpasses([]);
    setNotifications([]);
    setAuditLogs([]);
    await loadDepartments();
  };

  const applyOutpass = async (data: {
    type: OutpassApplication['type'];
    destinationAddress: string;
    purpose: string;
    departureTime: string;
    expectedReturnTime: string;
    documents?: { name: string; size: string; type: 'pdf' | 'image' }[];
  }): Promise<string> => {
    const res = await apiFetch('/api/outpasses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok || !res.data.outpass) {
      throw new Error(res.data.error || 'Failed to submit outpass application.');
    }
    await refreshData();
    return res.data.outpass.id;
  };

  const approveOutpass = async (outpassId: string, remarks?: string) => {
    const res = await apiFetch(`/api/outpasses/${encodeURIComponent(outpassId)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const rejectOutpass = async (outpassId: string, reason: string) => {
    const res = await apiFetch(`/api/outpasses/${encodeURIComponent(outpassId)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const requestInfo = async (outpassId: string, query: string) => {
    const res = await apiFetch(`/api/outpasses/${encodeURIComponent(outpassId)}/request-info`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const updateContact = async (data: {
    phone: string;
    parentName: string;
    parentPhone: string;
    hostelBlock?: string;
    room?: string;
  }) => {
    const res = await apiFetch('/api/profile/contact', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { ok: false, error: res.data.error || 'Failed to update contact details.' };
    }
    await refreshData();
    return { ok: true };
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const res = await apiFetch('/api/profile/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { ok: false, error: res.data.error || 'Failed to update password.' };
    }
    return { ok: true, message: res.data.message || 'Password updated successfully.' };
  };

  const markNotificationRead = async (notifId: string) => {
    await apiFetch(`/api/notifications/${encodeURIComponent(notifId)}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleUserStatus = async (userId: string) => {
    const res = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/toggle`, { method: 'PATCH' });
    if (res.ok) {
      await refreshData();
    }
  };

  const addDepartment = async (dept: Omit<Department, 'id'>) => {
    const res = await apiFetch('/api/admin/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const res = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        users,
        departments,
        outpasses,
        notifications,
        auditLogs,
        isLoadingAuth,
        registerStudent,
        login,
        logout,
        refreshData,
        applyOutpass,
        approveOutpass,
        rejectOutpass,
        requestInfo,
        updateContact,
        changePassword,
        markNotificationRead,
        markAllNotificationsRead,
        toggleUserStatus,
        addDepartment,
        updateUserRole,
        activeOutpassFilter,
        setActiveOutpassFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
