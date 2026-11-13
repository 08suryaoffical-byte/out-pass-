import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
  onSelectOutpass?: (outpassId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onSelectOutpass,
}) => {
  const { users, outpasses } = useApp();

  const student = users.find(u => u.id === studentId) || users.find(u => u.role === 'student');
  const [historySearch, setHistorySearch] = useState('');

  if (!student) return null;

  const studentOutpasses = outpasses.filter(o => o.studentId === student.id);
  const totalApps = studentOutpasses.length;
  const approvedApps = studentOutpasses.filter(o => o.status === 'Approved' || o.status === 'Completed').length;
  const rejectedApps = studentOutpasses.filter(o => o.status === 'Rejected').length;
  const pendingApps = studentOutpasses.filter(o => o.status.startsWith('Pending')).length;

  const filteredHistory = studentOutpasses.filter(o =>
    o.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    o.destinationAddress.toLowerCase().includes(historySearch.toLowerCase()) ||
    o.type.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <span className="material-symbols-outlined text-lg">badge</span>
            </span>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Student Dossier
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{student.name}</span>
                <span className="font-mono text-blue-400">({student.registerNumber})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Profile Dossier Header */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center border border-slate-300 shadow-xs uppercase tracking-wider shrink-0">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified Resident
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Reg No: <strong className="text-slate-700">{student.registerNumber}</strong> • {student.departmentName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {student.year} • {student.section} • {student.hostelBlock} ({student.room})
                </p>
              </div>
            </div>

            {/* Contact Pills & University Logo on the right */}
            <div className="flex items-center gap-4">
              <div className="text-xs space-y-1 text-slate-600 sm:text-right">
                <div>
                  <span className="text-slate-400">Email: </span>
                  <span className="font-medium text-slate-800">{student.email}</span>
                </div>
                <div>
                  <span className="text-slate-400">Phone: </span>
                  <span className="font-mono text-slate-800">{student.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Guardian: </span>
                  <span className="font-medium text-slate-800">{student.parentName} ({student.parentPhone})</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/assets/aistudio/dsu_983323a0.webp"
                  alt="Dhanalakshmi Srinivasan University Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* 4 Application Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Submitted</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalApps}</span>
              <span className="text-[10px] text-slate-400">All terms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Approved</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">{approvedApps}</span>
              <span className="text-[10px] text-emerald-600 font-medium">Cleared</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingApps}</span>
              <span className="text-[10px] text-amber-600 font-medium">In Review</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rejected</span>
              <span className="text-2xl font-bold text-rose-600 mt-1 block">{rejectedApps}</span>
              <span className="text-[10px] text-slate-400">Declined</span>
            </div>
          </div>

          {/* Complete Outpass History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-base">history</span>
                  Complete Outpass History ({studentOutpasses.length} records)
                </h4>
              </div>
              <input
                type="text"
                placeholder="Filter history..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Outpass ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Departure & Return</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No outpasses found for this student.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                          #{item.id}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                          {item.type}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate">
                          {item.destinationAddress.split(',')[0]}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-500">
                          {item.departureTime.split('T')[0]} → {item.expectedReturnTime.split('T')[0]}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.durationString}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'Approved' || item.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-slate-500 italic max-w-xs truncate">
                          {item.rejectionReason || item.approvalSteps[1]?.remarks || 'Approved'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
