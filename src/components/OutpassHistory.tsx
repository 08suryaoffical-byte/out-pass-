import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassApplication } from '../types';

interface OutpassHistoryProps {
  onSelectOutpass?: (outpassId: string) => void;
  onApplyNew?: () => void;
}

export const OutpassHistory: React.FC<OutpassHistoryProps> = ({ onSelectOutpass, onApplyNew }) => {
  const { outpasses, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter outpasses for current student (or all if faculty/admin)
  const baseList = useMemo(() => {
    return outpasses.filter(o =>
      currentUser?.role === 'student' ? o.studentId === currentUser.id : true
    );
  }, [outpasses, currentUser]);

  const filtered = useMemo(() => {
    return baseList.filter(o => {
      const matchSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.purpose.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === 'ALL' || o.type === selectedType;
      
      let matchStatus = true;
      if (selectedStatus === 'APPROVED') matchStatus = o.status === 'Approved';
      else if (selectedStatus === 'PENDING') matchStatus = o.status.startsWith('Pending');
      else if (selectedStatus === 'REJECTED') matchStatus = o.status === 'Rejected';
      else if (selectedStatus === 'COMPLETED') matchStatus = o.status === 'Completed';

      return matchSearch && matchType && matchStatus;
    });
  }, [baseList, searchTerm, selectedType, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Outpass ID', 'Type', 'Destination', 'Departure', 'Return', 'Duration', 'Status', 'Submitted At'];
    const rows = filtered.map(o => [
      o.id,
      `"${o.type}"`,
      `"${o.destinationAddress.replace(/"/g, '""')}"`,
      o.departureTime,
      o.expectedReturnTime,
      `"${o.durationString}"`,
      o.status,
      o.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outpass_history_${currentUser?.registerNumber || 'student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
            <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Residential Archive</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Outpass History</h1>
          <p className="text-sm text-slate-500">
            Historical audit log of all residential leaves, turnstile authorizations, and departure approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
          {onApplyNew && (
            <button
              type="button"
              onClick={onApplyNew}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Apply for Outpass</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* 4 Bento Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outpasses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{baseList.length}</h3>
            <span className="text-[11px] text-slate-500">All residential logs</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-2xl">folder_shared</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Timely Returns</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">94.4%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">17 of 18 scans on-time</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curfew Violations</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">00</h3>
            <span className="text-[11px] text-slate-500">Zero infractions logged</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <span className="material-symbols-outlined text-2xl">gavel</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Clearance Time</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">2.4 hrs</h3>
            <span className="text-[11px] text-slate-500">Mentor & HOD desks</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <span className="material-symbols-outlined text-2xl">speed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search by ID, destination, or purpose..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Categories</option>
            <option value="Home Visit">Weekend Home Visit</option>
            <option value="Local Day Out">Local Day Out</option>
            <option value="Emergency Medical">Emergency Medical</option>
            <option value="Official Duty">Official Duty</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {(searchTerm || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Outpass ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Destination & Reason</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4">Curfew Return</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No matching outpass records found.
                  </td>
                </tr>
              ) : (
                currentRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      #{item.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.type}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 truncate">
                        {item.destinationAddress.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.purpose}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.departureTime.split('T')[0]} {item.departureTime.split('T')[1]?.slice(0, 5)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.expectedReturnTime.split('T')[0]} {item.expectedReturnTime.split('T')[1]?.slice(0, 5)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.durationString}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {item.status === 'Approved' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">done_all</span>
                          Gate Token Ready
                        </span>
                      ) : item.status === 'Rejected' ? (
                        <span className="text-rose-700 font-semibold">
                          Declined ({item.rejectionStage || 'Authority'})
                        </span>
                      ) : (
                        <span className="text-blue-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          Stage {item.currentStage} of {item.totalStages}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                      )}
                      {item.status === 'Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          Rejected
                        </span>
                      )}
                      {item.status === 'Completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          Completed
                        </span>
                      )}
                      {item.status.startsWith('Pending') && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (onSelectOutpass) onSelectOutpass(item.id);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded font-medium text-xs inline-flex items-center gap-1 transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Track</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
            <span className="font-semibold text-slate-700">{filtered.length}</span> records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-semibold transition ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Destination Distribution */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">pie_chart</span>
            Frequent Travel Destinations
          </h4>
          <p className="text-xs text-slate-500">Distribution of outpass transit patterns over current academic year.</p>

          <div className="space-y-2.5 pt-2">
            {[
              { city: 'Coimbatore (Permanent Residence)', pct: 44, color: 'bg-blue-600' },
              { city: 'Bangalore (Urban Transit)', pct: 28, color: 'bg-indigo-600' },
              { city: 'Chennai (Institutional Symposium)', pct: 16, color: 'bg-cyan-600' },
              { city: 'Local Municipal Outings', pct: 12, color: 'bg-slate-400' },
            ].map(d => (
              <div key={d.city}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{d.city}</span>
                  <span className="font-mono text-slate-500">{d.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${d.color} h-2 rounded-full`} style={{ width: `${d.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biometric Turnstile Rating */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-base">fingerprint</span>
              Biometric Turnstile Compliance
            </h4>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 text-xl">
                A+
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">100% Adherence</div>
                <p className="text-xs text-slate-500">Zero turnstile alarms or missing egress checkout entries logged.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Exit: Kaveri Gate 01</span>
            <span className="text-emerald-600 font-semibold">Institutional Grade: Exemplary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
