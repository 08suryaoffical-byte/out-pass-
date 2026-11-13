import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassApplication } from '../types';

interface FacultyDashboardProps {
  onOpenDossier: (outpassId: string) => void;
  onViewStudentProfile?: (studentId: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onOpenDossier, onViewStudentProfile }) => {
  const { currentUser, outpasses, users, approveOutpass, rejectOutpass } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickRemark, setQuickRemark] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Academic schedule conflict with scheduled laboratory sessions.');

  // Faculty department filter - CSE faculty handles CSE students
  const deptOutpasses = useMemo(() => {
    return outpasses.filter(o => o.departmentId === (currentUser?.departmentId || 'dept-cse'));
  }, [outpasses, currentUser]);

  // Statistics
  const pendingCount = deptOutpasses.filter(o => o.status === 'Pending Mentor').length;
  const approvedCount = deptOutpasses.filter(o => o.status === 'Approved' || o.status === 'Pending HOD' || o.status === 'Pending Dean/Admin').length;
  const rejectedCount = deptOutpasses.filter(o => o.status === 'Rejected').length;
  const totalCount = deptOutpasses.length;

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    return deptOutpasses.filter(o => {
      const matchSearch =
        o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase());

      let matchTab = true;
      if (activeTab === 'PENDING') matchTab = o.status === 'Pending Mentor';
      else if (activeTab === 'APPROVED') matchTab = o.status === 'Approved' || o.status.startsWith('Pending HOD') || o.status.startsWith('Pending Dean');
      else if (activeTab === 'REJECTED') matchTab = o.status === 'Rejected';

      return matchSearch && matchTab;
    });
  }, [deptOutpasses, searchTerm, activeTab]);

  // Quick action approve
  const handleQuickApprove = (id: string) => {
    approveOutpass(id, 'Academic attendance verified. Stage 1 cleared.');
  };

  const handleConfirmReject = () => {
    if (rejectModalId && rejectReason.trim()) {
      rejectOutpass(rejectModalId, rejectReason.trim());
      setRejectModalId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
              <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Faculty Mentor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome Back, {currentUser?.name || 'Sivaselvi (AP/CYS)'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Review and endorse residential leave authorizations for your assigned mentee roster. You currently have{' '}
              <strong className="text-white underline decoration-blue-400 underline-offset-4">{pendingCount} pending requests</strong> awaiting Stage 1 evaluation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white border-2 border-amber-300 shadow-lg flex items-center justify-center shrink-0">
              <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Assigned Mentees</span>
              <span className="text-2xl font-bold text-white">42</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Approval SLA</span>
              <span className="text-2xl font-bold text-emerald-400">1.8 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeTab === 'PENDING' ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{pendingCount}</h3>
              <span className="text-[11px] text-blue-600 font-medium">Requires Stage 1 action</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('APPROVED')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeTab === 'APPROVED' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Outpasses</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{approvedCount}</h3>
              <span className="text-[11px] text-emerald-600 font-medium">Cleared for turnstile</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('REJECTED')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeTab === 'REJECTED' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rejected / Flagged</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">{rejectedCount}</h3>
              <span className="text-[11px] text-rose-600 font-medium">Curfew/attendance conflicts</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <span className="material-symbols-outlined text-2xl">block</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('ALL')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition shadow-sm hover:shadow ${
            activeTab === 'ALL' ? 'ring-2 ring-slate-500 border-slate-500 bg-slate-50/50' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Processed</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalCount}</h3>
              <span className="text-[11px] text-slate-500">Current Academic Term</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {[
            { id: 'PENDING', label: 'Action Required', count: pendingCount },
            { id: 'APPROVED', label: 'Approved', count: approvedCount },
            { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
            { id: 'ALL', label: 'All Applications', count: totalCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search by student, roll number, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Main Table: Outpass Review Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-lg">checklist</span>
            Stage 1 Mentor Evaluation Queue
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredRecords.length} student application{filteredRecords.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Outpass Details</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Departure & Return</th>
                <th className="py-3 px-4">Duration & Tier</th>
                <th className="py-3 px-4">Parental OTP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">task</span>
                    <p className="font-semibold text-slate-600">No applications in this view</p>
                    <p className="text-[11px]">All assigned students are currently accounted for.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center border border-slate-200 uppercase tracking-wider shrink-0">
                          {item.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => onViewStudentProfile && onViewStudentProfile(item.studentId)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-xs text-left"
                          >
                            {item.studentName}
                          </button>
                          <div className="text-[11px] font-mono text-slate-400">
                            {item.registerNumber} • {item.yearSection}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Outpass ID & Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-600 block">#{item.id}</span>
                      <span className="font-medium text-slate-700">{item.type}</span>
                    </td>

                    {/* Destination & Purpose */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">
                        {item.destinationAddress.split(',')[0]}
                      </p>
                      <p className="text-[11px] text-slate-400 italic truncate">
                        "{item.purpose}"
                      </p>
                    </td>

                    {/* Departure & Return */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-slate-800">
                        DEP: {item.departureTime.split('T')[0]} {item.departureTime.split('T')[1]?.slice(0, 5)}
                      </div>
                      <div className="text-slate-500">
                        RET: {item.expectedReturnTime.split('T')[0]} {item.expectedReturnTime.split('T')[1]?.slice(0, 5)}
                      </div>
                    </td>

                    {/* Duration & Tier */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block text-xs">{item.durationString}</span>
                      {item.isExtended ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          HOD Tier 2 Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Mentor Solo Clearance
                        </span>
                      )}
                    </td>

                    {/* Parental OTP State */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Verified SMS OTP
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'Approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                      )}
                      {item.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          Rejected
                        </span>
                      )}
                      {item.status === 'Pending Mentor' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          Pending Mentor
                        </span>
                      )}
                      {(item.status === 'Pending HOD' || item.status === 'Pending Dean/Admin') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Escalated ({item.status.replace('Pending ', '')})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDossier(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Dossier</span>
                        </button>

                        {item.status === 'Pending Mentor' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(item.id)}
                              title="Quick Approve"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                            >
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalId(item.id)}
                              title="Reject Application"
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition"
                            >
                              <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-bold text-slate-900 text-base">Reject Outpass Application</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Please state the institutional justification for declining outpass #{rejectModalId}. The student and hostel warden will be formally notified.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalId(null)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
