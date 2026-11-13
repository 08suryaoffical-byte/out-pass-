import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassApplication } from '../types';

interface HODDashboardProps {
  onOpenDossier: (outpassId: string) => void;
  onViewStudentProfile?: (studentId: string) => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({ onOpenDossier, onViewStudentProfile }) => {
  const { currentUser, outpasses, users, departments, approveOutpass, rejectOutpass } = useApp();

  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [search, setSearch] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Department schedule non-adherence.');

  const dept = departments.find(d => d.id === currentUser?.departmentId) || departments[0];

  // Applications from this department
  const deptOutpasses = useMemo(() => {
    return outpasses.filter(o => o.departmentId === (currentUser?.departmentId || 'dept-cse'));
  }, [outpasses, currentUser]);

  // Statistics
  const pendingHODCount = deptOutpasses.filter(o => o.status === 'Pending HOD').length;
  const approvedCount = deptOutpasses.filter(o => o.status === 'Approved' || o.status === 'Pending Dean/Admin').length;
  const rejectedCount = deptOutpasses.filter(o => o.status === 'Rejected').length;
  const activeExits = deptOutpasses.filter(o => o.status === 'Approved').length;

  const filtered = useMemo(() => {
    return deptOutpasses.filter(o => {
      const matchSearch =
        o.studentName.toLowerCase().includes(search.toLowerCase()) ||
        o.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.destinationAddress.toLowerCase().includes(search.toLowerCase());

      let matchTab = true;
      if (activeFilter === 'PENDING') matchTab = o.status === 'Pending HOD';
      else if (activeFilter === 'APPROVED') matchTab = o.status === 'Approved' || o.status === 'Pending Dean/Admin';

      return matchSearch && matchTab;
    });
  }, [deptOutpasses, search, activeFilter]);

  const handleQuickApprove = (id: string) => {
    approveOutpass(id, 'Department leave approved. Endorsed to Associate Dean.');
  };

  const handleConfirmReject = () => {
    if (rejectId && rejectReason.trim()) {
      rejectOutpass(rejectId, rejectReason);
      setRejectId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
              <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • HOD Console ({dept?.name || 'Cyber Security (CYS)'})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Head of Department Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Executive oversight and Stage 2 clearance for extended residential outpasses (&gt;48 hours) across {dept?.studentCount || 420} department students and {dept?.facultyCount || 28} faculty mentors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white border-2 border-amber-300 shadow-lg flex items-center justify-center shrink-0">
              <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Dept Students</span>
              <span className="text-2xl font-bold text-white">{dept?.studentCount || 420}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Faculty Mentors</span>
              <span className="text-2xl font-bold text-white">{dept?.facultyCount || 28}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter('PENDING')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeFilter === 'PENDING' ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending HOD Endorsements</p>
              <h3 className="text-3xl font-bold text-indigo-600 mt-1">{pendingHODCount}</h3>
              <span className="text-[11px] text-indigo-600 font-medium">Stage 2 action required</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <span className="material-symbols-outlined text-2xl">rule</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('APPROVED')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeFilter === 'APPROVED' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Outpasses</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{approvedCount}</h3>
              <span className="text-[11px] text-emerald-600 font-medium">Endorsed to Dean</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Campus Exits</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{activeExits}</h3>
              <span className="text-[11px] text-slate-500">Currently past turnstiles</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-2xl">door_open</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rejected / Escalated</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{rejectedCount}</h3>
              <span className="text-[11px] text-slate-500">Returned to faculty</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
              <span className="material-symbols-outlined text-2xl">assignment_return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Table and Mentor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: HOD Clearance Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-lg">fact_check</span>
                  Pending HOD Approvals (&gt;48h Extended Leaves)
                </h2>
                <p className="text-xs text-slate-500">
                  Applications endorsed by Faculty Mentors requiring departmental sanction.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Outpass ID & Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Mentor Endorsement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">task_alt</span>
                        <p className="font-semibold text-slate-600">HOD Queue Clear</p>
                        <p className="text-[11px]">No extended outpass applications pending Stage 2 clearance.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const mentorStep = item.approvalSteps.find((s: any) => s.roleName.includes('Mentor'));
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center border border-slate-200 uppercase tracking-wider shrink-0">
                                {item.studentName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => onViewStudentProfile && onViewStudentProfile(item.studentId)}
                                  className="font-bold text-slate-900 hover:text-indigo-600 text-xs block text-left"
                                >
                                  {item.studentName}
                                </button>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {item.registerNumber} • {item.yearSection}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-indigo-600 block">#{item.id}</span>
                            <span className="font-medium text-slate-700">{item.type}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">{item.durationString}</span>
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                              &gt;48h Rule
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-[11px] text-slate-700 italic truncate">
                              "{mentorStep?.remarks || 'Attendance and lab schedules verified. Approved.'}"
                            </div>
                            <div className="text-[10px] font-medium text-emerald-700 mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              Endorsed by {mentorStep?.approverName || 'Mentor'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {item.status === 'Pending HOD' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                                In Review
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                {item.status}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenDossier(item.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                <span>Endorse Dossier</span>
                              </button>

                              {item.status === 'Pending HOD' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApprove(item.id)}
                                    title="Quick Endorse"
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                                  >
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectId(item.id)}
                                    title="Decline"
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition"
                                  >
                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Mentor Distribution & Policy */}
        <div className="lg:col-span-4 space-y-6">
          {/* Faculty Mentor Activity Distribution */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-base">supervisor_account</span>
                Faculty Mentor Distribution
              </span>
              <span className="text-[10px] text-slate-400">Live Status</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Sivaselvi (AP/CYS)', pending: 2, approved: 14, speed: '1.4h' },
                { name: 'Dr. P. Mehra', pending: 1, approved: 11, speed: '2.1h' },
                { name: 'Dr. A. Sen', pending: 0, approved: 9, speed: '1.9h' },
                { name: 'Dr. V. Nambiar', pending: 3, approved: 16, speed: '3.2h' },
              ].map((mentor, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{mentor.name}</div>
                    <div className="text-[11px] text-slate-400">Avg Turnaround: {mentor.speed}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {mentor.pending} In-Queue
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {mentor.approved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Rule Notice */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200 text-xs text-indigo-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <span className="material-symbols-outlined text-base">verified_user</span>
              Extended Outpass Policy (Rule 48-B)
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Any residential departure spanning greater than 48 hours requires mandatory Stage 2 sign-off from the Head of Department before reaching the Associate Dean. Ensure no lab exam or internal assessment is scheduled during student egress.
            </p>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base text-rose-600 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Decline HOD Endorsement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the department justification for returning or rejecting outpass #{rejectId}:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 text-xs font-semibold border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
