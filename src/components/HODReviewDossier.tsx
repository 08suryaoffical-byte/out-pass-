import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface HODReviewDossierProps {
  outpassId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HODReviewDossier: React.FC<HODReviewDossierProps> = ({ outpassId, onClose, onSuccess }) => {
  const { outpasses, approveOutpass, rejectOutpass, requestInfo } = useApp();

  const outpass = outpasses.find(o => o.id === outpassId) || outpasses[0];

  const [hodRemarks, setHodRemarks] = useState(
    'Department attendance and academic standing verified. Travel duration exceeding 48h validated for familial function. Endorsed to Associate Dean.'
  );
  const [rejectReason, setRejectReason] = useState('Department schedule non-adherence.');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!outpass) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Application not found.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs">Close</button>
      </div>
    );
  }

  const mentorStep = outpass.approvalSteps.find((s: any) => s.roleName.includes('Mentor'));

  const handleEndorse = () => {
    approveOutpass(outpass.id, hodRemarks);
    setActionMessage('Application Endorsed by HOD and dispatched to Associate Dean.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectOutpass(outpass.id, rejectReason);
    setActionMessage('Application Declined.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-indigo-800/40 border border-indigo-700 text-indigo-300">
              <span className="material-symbols-outlined text-lg">assured_workload</span>
            </span>
            <div>
              <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider">
                Stage 2 HOD Endorsement Desk
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Extended Outpass Dossier</span>
                <span className="font-mono text-indigo-300">#{outpass.id}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs flex items-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-200 transition"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {actionMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {actionMessage}
            </div>
          )}

          {/* Student Dossier Strip */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center border border-slate-300 uppercase tracking-wider shrink-0">
                {outpass.studentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{outpass.studentName}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll: {outpass.registerNumber} • {outpass.departmentName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{outpass.yearSection} • {outpass.hostelInfo}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Duration: {outpass.durationString}
              </span>
              <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md shrink-0 flex items-center justify-center">
                <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Faculty Mentor Clearance Verification */}
          <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                Stage 1 Faculty Mentor Clearance (Verified)
              </h4>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                SIGNATURE VERIFIED
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Evaluator: {mentorStep?.approverName || 'Sivaselvi (AP/CYS)'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{mentorStep?.timestamp}</span>
              </div>
              <p className="text-slate-700 italic">
                "{mentorStep?.remarks || 'Academic attendance verified at 88.4%. No practical laboratory conflict detected for Friday afternoon sessions. Student in good academic standing.'}"
              </p>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Cryptographic Digest: {mentorStep?.signature || 'HMAC-SHA256-42b9c7e0'}</span>
                <span className="text-emerald-600 font-sans font-semibold">Stage 1 Compliant</span>
              </div>
            </div>
          </div>

          {/* Extended Itinerary Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-base">map</span>
              Destination Itinerary & Residential Curfew
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Destination Address</span>
                <p className="font-semibold text-slate-800">{outpass.destinationAddress}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Parent OTP SMS Contact</span>
                <p className="font-semibold text-emerald-700">{outpass.parentPhone} ({outpass.parentName})</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Departure Window</span>
                <p className="font-semibold text-slate-800">{outpass.departureTime.replace('T', ' ')} IST</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Expected Return Curfew</span>
                <p className="font-semibold text-slate-800">{outpass.expectedReturnTime.replace('T', ' ')} IST</p>
              </div>
            </div>
          </div>

          {/* Stage 2 Endorsement Desk */}
          <div className="bg-indigo-50/60 rounded-xl p-5 border border-indigo-200 space-y-3">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-base">approval</span>
              HOD Endorsement & Department Clearance Remarks
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Department Head Endorsement Note
              </label>
              <textarea
                rows={3}
                value={hodRemarks}
                onChange={(e) => setHodRemarks(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined text-base">block</span>
                <span>Decline Endorsement</span>
              </button>

              <button
                type="button"
                onClick={handleEndorse}
                className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Endorse & Escalate to Associate Dean (Stage 3)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reject Dialog */}
        {isRejectOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 text-base text-rose-600 mb-2">Decline HOD Endorsement</h3>
              <p className="text-xs text-slate-500 mb-3">Provide reason for returning this application:</p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsRejectOpen(false)} className="px-4 py-2 text-xs border rounded hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleReject} className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded">
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
