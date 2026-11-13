import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassApplication } from '../types';

interface FacultyReviewDossierProps {
  outpassId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FacultyReviewDossier: React.FC<FacultyReviewDossierProps> = ({ outpassId, onClose, onSuccess }) => {
  const { outpasses, approveOutpass, rejectOutpass, requestInfo } = useApp();

  const outpass = outpasses.find(o => o.id === outpassId) || outpasses[0];

  const [remarks, setRemarks] = useState(
    'Academic attendance verified at 88.4%. No practical laboratory conflict detected for Friday afternoon sessions. Student in good academic standing; leave strongly recommended.'
  );
  const [rejectReason, setRejectReason] = useState('Academic schedule conflict with scheduled laboratory sessions.');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [infoQuery, setInfoQuery] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!outpass) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Application not found.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs">
          Close
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    approveOutpass(outpass.id, remarks);
    setActionDone('Application Approved & Endorsed to next clearance tier.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectOutpass(outpass.id, rejectReason);
    setActionDone('Application Rejected.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const handleRequestInfo = () => {
    if (!infoQuery.trim()) return;
    requestInfo(outpass.id, infoQuery);
    setIsInfoOpen(false);
    setInfoQuery('');
    alert('Clarification request sent to student via in-app alert.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <span className="material-symbols-outlined text-lg">fact_check</span>
            </span>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Stage 1 Mentor Decision Desk
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Review Outpass Dossier</span>
                <span className="font-mono text-blue-400">#{outpass.id}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {actionDone && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {actionDone}
            </div>
          )}

          {/* Student Dossier Overview */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center border border-slate-300 shadow-xs uppercase tracking-wider shrink-0">
                {outpass.studentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{outpass.studentName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {outpass.yearSection}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll: <strong className="text-slate-700">{outpass.registerNumber}</strong> • {outpass.departmentName}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {outpass.hostelInfo} • <span className="font-semibold text-slate-700">{outpass.roomNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & University Crest */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-white border border-slate-200 min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">CGPA</span>
                  <span className="text-base font-bold text-emerald-600">8.92</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attendance</span>
                  <span className="text-base font-bold text-blue-600">88.4%</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md shrink-0 flex items-center justify-center">
                <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Itinerary & Destination Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">alt_route</span>
              Journey & Destination Itinerary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Destination Address
                </span>
                <p className="font-semibold text-slate-800">{outpass.destinationAddress}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reason for Leaving / Purpose
                </span>
                <p className="font-medium text-slate-700 italic">"{outpass.purpose}"</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Departure Window
                </span>
                <p className="font-semibold text-slate-800">{outpass.departureTime.replace('T', ' ')} IST</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Expected Return Curfew
                </span>
                <p className="font-semibold text-slate-800">{outpass.expectedReturnTime.replace('T', ' ')} IST</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Duration
                </span>
                <p className="font-bold text-blue-600">{outpass.durationString}</p>
                {outpass.isExtended && (
                  <span className="text-[10px] font-bold text-amber-700 mt-0.5 block">
                    Requires Stage 2 (HOD) & Stage 3 (Dean) sign-off
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Parental Verification
                </span>
                <p className="font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  OTP Verified ({outpass.parentPhone})
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Guardian: {outpass.parentName}</span>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">description</span>
              Supporting Evidence & Attachments
            </h4>

            <div className="space-y-2">
              {outpass.documents.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded bg-rose-100 text-rose-700">
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">{doc.name}</span>
                      <span className="text-[11px] text-slate-400">{doc.size} • Verified Institutional Format</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Viewing document: ${doc.name}`)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-blue-600 text-xs flex items-center gap-1 transition"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Desk Form */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200 space-y-4">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">gavel</span>
              Stage 1 Mentor Endorsement & Remarks
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Faculty Remarks / Endorsement Note (Included in Official Audit Ledger)
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(!isInfoOpen)}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-base text-amber-500">help</span>
                  <span>Request Clarification</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg flex items-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  <span>Reject Pass</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleApprove}
                className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>
                  {outpass.isExtended ? 'Endorse & Forward to HOD (Stage 2)' : 'Approve Outpass (Direct Cleared)'}
                </span>
              </button>
            </div>

            {/* Clarification prompt */}
            {isInfoOpen && (
              <div className="p-3.5 bg-white rounded-lg border border-amber-200 space-y-2 mt-2">
                <label className="text-xs font-semibold text-slate-800 block">
                  Message for Student {outpass.studentName}:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please bring original physical train ticket to cabin #204 before exit..."
                  value={infoQuery}
                  onChange={(e) => setInfoQuery(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInfoOpen(false)}
                    className="px-3 py-1 text-xs border rounded hover:bg-slate-50 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestInfo}
                    className="px-4 py-1 text-xs bg-amber-600 text-white font-semibold rounded hover:bg-amber-700"
                  >
                    Send Query
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reject Dialog */}
        {isRejectOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 text-base text-rose-600 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">warning</span>
                Confirm Stage 1 Rejection
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Declining this application will revoke gate clearance and record the violation advisory.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRejectOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
