import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, Department } from '../types';

interface UserManagementProps {
  onViewStudentProfile?: (studentId: string) => void;
  onViewOutpass?: (outpassId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onViewStudentProfile, onViewOutpass }) => {
  const { users, departments, toggleUserStatus, updateUserRole, addDepartment, auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState<'USERS' | 'DEPARTMENTS' | 'AUDIT'>('USERS');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Add Department Modal
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [hodName, setHodName] = useState('');

  // Edit user role modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchDept = deptFilter === 'ALL' || u.departmentId === deptFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.registerNumber && u.registerNumber.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchDept && matchSearch;
  });

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) return;
    addDepartment({
      code: deptCode.toUpperCase(),
      name: deptName,
      hodId: `user-hod-${deptCode.toLowerCase()}`,
      hodName: hodName || `Dr. ${deptCode.toUpperCase()} Head`,
      studentCount: 120,
      facultyCount: 12,
    });
    setIsAddDeptOpen(false);
    setDeptCode('');
    setDeptName('');
    setHodName('');
  };

  const handleUpdateRole = () => {
    if (editingUser) {
      updateUserRole(editingUser.id, newRole);
      setEditingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
            <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Governance Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">User & Role Administration</h1>
          <p className="text-sm text-slate-500">
            Control institutional permissions, manage academic rosters, configure departments, and inspect security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddDeptOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Department</span>
          </button>
          <div className="w-12 h-12 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md shrink-0 flex items-center justify-center">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'USERS', label: 'All Users & Credentials', icon: 'group', count: users.length },
          { id: 'DEPARTMENTS', label: 'Academic Departments', icon: 'domain', count: departments.length },
          { id: 'AUDIT', label: 'Security Audit Logs', icon: 'security', count: auditLogs.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Search by name, email, or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty Mentor</option>
                <option value="hod">Head of Department</option>
                <option value="admin">Associate Dean / Admin</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Academic & Room</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center border border-slate-200 uppercase tracking-wider shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin'
                            ? 'bg-rose-100 text-rose-800'
                            : user.role === 'hod'
                            ? 'bg-indigo-100 text-indigo-800'
                            : user.role === 'faculty'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {user.departmentName}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {user.registerNumber ? `${user.registerNumber} • ${user.room}` : user.designation || 'Staff'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {user.phone}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          user.active ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {user.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === 'student' && onViewStudentProfile && (
                            <button
                              type="button"
                              onClick={() => onViewStudentProfile(user.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Profile"
                            >
                              <span className="material-symbols-outlined text-base">person</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Edit Role"
                          >
                            <span className="material-symbols-outlined text-base">manage_accounts</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1 rounded ${
                              user.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.active ? 'Deactivate Account' : 'Activate Account'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {user.active ? 'pause_circle' : 'play_circle'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                  {dept.code}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  ID: {dept.id}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Head of Department: {dept.hodName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Students</span>
                  <span className="text-base font-bold text-slate-800">{dept.studentCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Faculty</span>
                  <span className="text-base font-bold text-blue-600">{dept.facultyCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">policy</span>
              Cryptographic Turnstile & Egress Audit Trail
            </h3>
            <span className="text-xs font-mono text-slate-400">Tamper-evident system ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Entity / Target</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Cryptographic Details</th>
                  <th className="py-3 px-4">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {log.entityName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 whitespace-nowrap">
                      {log.performedBy}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate text-[11px]">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'Verified' || log.status === 'Authorized'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'Flagged'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">domain_add</span>
              Create Academic Department
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. AI-DS, CHEM, ARCH"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Head of Department (HOD) Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. M. Sundaram"
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-1">Change User Role</h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating institutional permissions for <strong className="text-slate-800">{editingUser.name}</strong>
            </p>

            <div className="space-y-3 text-xs mb-4">
              {(['student', 'faculty', 'hod', 'admin'] as UserRole[]).map(r => (
                <label key={r} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="userRole"
                    value={r}
                    checked={newRole === r}
                    onChange={() => setNewRole(r)}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[11px] block">{r}</span>
                    <span className="text-slate-400 text-[10px]">
                      {r === 'student' && 'Apply, Track outpass, Gate QR token'}
                      {r === 'faculty' && 'Stage 1 Mentor Evaluation & student roster'}
                      {r === 'hod' && 'Stage 2 Department Extended Clearance (>48h)'}
                      {r === 'admin' && 'Stage 3 Final Sanction, Users & Settings'}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
