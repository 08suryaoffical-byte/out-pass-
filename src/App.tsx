/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { DashboardShell } from './components/DashboardShell';
import { StudentDashboard } from './components/StudentDashboard';
import { ApplyOutpass } from './components/ApplyOutpass';
import { TrackOutpass } from './components/TrackOutpass';
import { OutpassHistory } from './components/OutpassHistory';
import { StudentProfile } from './components/StudentProfile';
import { FacultyDashboard } from './components/FacultyDashboard';
import { FacultyReviewDossier } from './components/FacultyReviewDossier';
import { HODDashboard } from './components/HODDashboard';
import { HODReviewDossier } from './components/HODReviewDossier';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminReviewDossier } from './components/AdminReviewDossier';
import { UserManagement } from './components/UserManagement';
import { StudentProfileModal } from './components/StudentProfileModal';

const AppContent: React.FC = () => {
  const { currentUser, currentRole, notifications, markAllNotificationsRead, users } = useApp();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [trackOutpassId, setTrackOutpassId] = useState<string | undefined>(undefined);

  // Reset tab to dashboard on role change
  useEffect(() => {
    setCurrentTab('dashboard');
    setActiveDossierId(null);
    setViewingStudentId(null);
  }, [currentRole]);

  if (!currentUser) {
    return <LoginPage />;
  }

  // Handle student roster lookup for Faculty and HOD
  const departmentStudents = users.filter(u => u.role === 'student' && u.departmentId === currentUser.departmentId);

  return (
    <DashboardShell currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* 1. STUDENT VIEWS */}
      {currentRole === 'student' && (
        <>
          {currentTab === 'dashboard' && (
            <StudentDashboard
              onNavigate={(tab, outpassId) => {
                if (outpassId) setTrackOutpassId(outpassId);
                setCurrentTab(tab);
              }}
            />
          )}

          {currentTab === 'apply-outpass' && (
            <ApplyOutpass
              onSuccess={(newId) => {
                setTrackOutpassId(newId);
                setCurrentTab('my-applications');
              }}
              onCancel={() => setCurrentTab('dashboard')}
            />
          )}

          {(currentTab === 'my-applications' || currentTab === 'gate-passes') && (
            <TrackOutpass
              initialOutpassId={trackOutpassId}
              onNavigateApply={() => setCurrentTab('apply-outpass')}
            />
          )}

          {currentTab === 'outpass-history' && (
            <OutpassHistory
              onSelectOutpass={(id) => {
                setTrackOutpassId(id);
                setCurrentTab('my-applications');
              }}
              onApplyNew={() => setCurrentTab('apply-outpass')}
            />
          )}

          {currentTab === 'hostel-profile' && <StudentProfile />}

          {currentTab === 'support-and-help' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <span className="material-symbols-outlined text-2xl">help</span>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Residential Support & Emergency Helpdesk</h2>
                  <p className="text-xs text-slate-500">Dhanalakshmi Srinivasan University, Samayapuram, Trichy • 24/7 Hostel affairs, gate security escalation, and warden support</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="material-symbols-outlined text-2xl text-blue-600">domain</span>
                  <h3 className="font-bold text-slate-900 text-sm">Hostel Warden Office</h3>
                  <p className="text-xs text-slate-500">Kaveri Boys Hostel • Ground Floor Office 102</p>
                  <p className="text-xs font-mono font-bold text-slate-700 pt-2">+91 044-2257-8900</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">verified_user</span>
                  <h3 className="font-bold text-slate-900 text-sm">Main Gate Security</h3>
                  <p className="text-xs text-slate-500">Turnstile mesh station & biometric override</p>
                  <p className="text-xs font-mono font-bold text-slate-700 pt-2">+91 044-2257-8911</p>
                </div>

                <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <span className="material-symbols-outlined text-2xl text-rose-600">emergency</span>
                  <h3 className="font-bold text-sm">Emergency Medical Desk</h3>
                  <p className="text-xs text-rose-700">Ambulance dispatch & Campus Health Center</p>
                  <p className="text-xs font-mono font-bold text-rose-800 pt-2">Extension 108 / 112</p>
                </div>
              </div>

              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-2">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">policy</span>
                  Standard Residential Curfew Regulations
                </h4>
                <p>1. Local outing outpasses have mandatory turnstile check-in prior to 21:00 IST.</p>
                <p>2. Overnight and weekend home visits require parent OTP verification before submission.</p>
                <p>3. Travel exceeding 48 hours is automatically forwarded for Department Head (HOD) and Associate Dean clearance.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. FACULTY VIEWS */}
      {currentRole === 'faculty' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'pending-approvals') && (
            <FacultyDashboard
              onOpenDossier={(id) => setActiveDossierId(id)}
              onViewStudentProfile={(sId) => setViewingStudentId(sId)}
            />
          )}

          {currentTab === 'my-students' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Assigned Student Mentees (Dept. of CSE)</h2>
                  <p className="text-xs text-slate-500">Students under your academic advisory and outpass oversight</p>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {departmentStudents.length} Active Mentees
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Register Number</th>
                      <th className="py-3 px-4">Year & Room</th>
                      <th className="py-3 px-4">Academic CGPA</th>
                      <th className="py-3 px-4">Guardian Contact</th>
                      <th className="py-3 px-4 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {departmentStudents.map(st => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{st.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">{st.registerNumber}</td>
                        <td className="py-3 px-4">{st.year} • {st.room}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">8.92</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{st.parentPhone}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setViewingStudentId(st.id)}
                            className="px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'approval-history' && (
            <OutpassHistory
              onSelectOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'faculty-profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Faculty Advisor Profile</h2>
                <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md flex items-center justify-center shrink-0">
                  <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center ring-2 ring-blue-100 uppercase tracking-wider shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'SS'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{currentUser.designation || 'Associate Professor'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.departmentName} • Cabin #204</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Extension</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. HOD VIEWS */}
      {currentRole === 'hod' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'pending-hod-approvals') && (
            <HODDashboard
              onOpenDossier={(id) => setActiveDossierId(id)}
              onViewStudentProfile={(sId) => setViewingStudentId(sId)}
            />
          )}

          {currentTab === 'department-outpasses' && (
            <OutpassHistory
              onSelectOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'department-students' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Department Student Directory (CSE)</h2>
                  <p className="text-xs text-slate-500">420 Enrolled Computer Science undergraduates</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Register Number</th>
                      <th className="py-3 px-4">Year & Room</th>
                      <th className="py-3 px-4">Assigned Mentor</th>
                      <th className="py-3 px-4 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {departmentStudents.map(st => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{st.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">{st.registerNumber}</td>
                        <td className="py-3 px-4">{st.year} • {st.room}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{st.mentorName || 'Sivaselvi (AP/CYS)'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setViewingStudentId(st.id)}
                            className="px-3 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'approval-history' && (
            <OutpassHistory
              onSelectOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'hod-profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Head of Department Profile</h2>
                <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md flex items-center justify-center shrink-0">
                  <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 to-slate-900 text-white font-bold text-xl flex items-center justify-center ring-2 ring-indigo-100 uppercase tracking-wider shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'RK'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">Head of Department • Dept. of Cyber Security (CYS)</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. ADMIN / ASSOCIATE DEAN VIEWS */}
      {currentRole === 'admin' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'pending-final-approvals' || currentTab === 'department-overview') && (
            <AdminDashboard
              onOpenDossier={(id) => setActiveDossierId(id)}
              onViewStudentProfile={(sId) => setViewingStudentId(sId)}
              onNavigateTab={(t) => setCurrentTab(t)}
            />
          )}

          {currentTab === 'all-college-outpasses' && (
            <OutpassHistory
              onSelectOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'user-management' && (
            <UserManagement
              onViewStudentProfile={(sId) => setViewingStudentId(sId)}
              onViewOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'approval-history' && (
            <UserManagement
              onViewStudentProfile={(sId) => setViewingStudentId(sId)}
              onViewOutpass={(id) => setActiveDossierId(id)}
            />
          )}

          {currentTab === 'admin-profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Associate Dean Profile</h2>
                <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md flex items-center justify-center shrink-0">
                  <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 text-white font-bold text-xl flex items-center justify-center ring-2 ring-blue-100 uppercase tracking-wider shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DS'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">Associate Dean of Student & Hostel Affairs</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* NOTIFICATIONS TAB (For all roles) */}
      {currentTab === 'notifications-page' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Notifications & Alerts</h2>
              <p className="text-xs text-slate-500">Live approval dispatches and turnstile security advisories</p>
            </div>
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start gap-3 ${
                  n.read ? 'bg-slate-50 border-slate-200/70' : 'bg-blue-50/50 border-blue-200'
                }`}
              >
                <span className={`p-2 rounded-lg text-lg material-symbols-outlined ${
                  n.type === 'approval' ? 'bg-emerald-100 text-emerald-700' :
                  n.type === 'rejection' ? 'bg-rose-100 text-rose-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {n.type === 'approval' ? 'check_circle' : n.type === 'rejection' ? 'cancel' : 'notifications'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  {n.linkOutpassId && (
                    <button
                      onClick={() => {
                        if (currentRole === 'student') {
                          setTrackOutpassId(n.linkOutpassId);
                          setCurrentTab('my-applications');
                        } else {
                          setActiveDossierId(n.linkOutpassId || null);
                        }
                      }}
                      className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Outpass #{n.linkOutpassId}</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL DOSSIER MODALS ACCORDING TO ROLE */}
      {activeDossierId && currentRole === 'faculty' && (
        <FacultyReviewDossier
          outpassId={activeDossierId}
          onClose={() => setActiveDossierId(null)}
        />
      )}

      {activeDossierId && currentRole === 'hod' && (
        <HODReviewDossier
          outpassId={activeDossierId}
          onClose={() => setActiveDossierId(null)}
        />
      )}

      {activeDossierId && currentRole === 'admin' && (
        <AdminReviewDossier
          outpassId={activeDossierId}
          onClose={() => setActiveDossierId(null)}
        />
      )}

      {/* STUDENT PROFILE DOSSIER (Accessible by Faculty, HOD, and Admin) */}
      {viewingStudentId && (
        <StudentProfileModal
          studentId={viewingStudentId}
          onClose={() => setViewingStudentId(null)}
        />
      )}
    </DashboardShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
