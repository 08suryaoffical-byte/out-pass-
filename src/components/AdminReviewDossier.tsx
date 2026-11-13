import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface AdminReviewDossierProps {
  outpassId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminReviewDossier: React.FC<AdminReviewDossierProps> = ({ outpassId, onClose, onSuccess }) => {
  const { outpasses, approveOutpass, rejectOutpass } = useApp();

  const outpass = outpasses.find(o => o.id === outpassId) || outpasses[0];

  const [adminRemarks, setAdminRemarks] = useState(
    'College-level administrative sanction granted. Egress pass synchronized with biometric turnstiles and security telemetry.'
  );
  const [rejectReason, setRejectReason] = useState('Administrative violation or curfew penalty.');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!outpass) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Application not found.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs">Close</button>
      </div>
    );
  }

  const handleGrantSanction = () => {
    approveOutpass(outpass.id, adminRemarks);
    setActionDone('Final Sanction Granted! Turnstile QR pass activated for egress.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const handleDeny = () => {
    if (!rejectReason.trim()) return;
    rejectOutpass(outpass.id, rejectReason);
    setActionDone('Application Administratively Denied.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            </span>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Stage 3 Associate Dean Final Sanction Desk
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sanction Outpass Dossier</span>
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
              <span className="hidden sm:inline">Print Pass</span>
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
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transit Duration</span>
                <span className="font-bold text-blue-600 text-base">{outpass.durationString}</span>
                <span className="text-[11px] text-slate-500 block">{outpass.type}</span>
              </div>
              <div className="w-14 h-14 rounded-full p-1 bg-white border-2 border-amber-300 shadow-md shrink-0 flex items-center justify-center">
                <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Endorsement Chain Audit */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">history_edu</span>
              Verified Institutional Endorsement Chain
            </h4>

            <div className="space-y-3">
              {outpass.approvalSteps.slice(0, 3).map((step: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {step.roleName}: {step.approverName || 'Institutional Officer'}
                    </div>
                    {step.remarks && (
                      <p className="text-slate-600 italic text-[11px] mt-1">"{step.remarks}"</p>
                    )}
                    {step.signature && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Signature: {step.signature}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                    {step.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Gate Verification Parameters */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-base">nest_cam_wired_stand</span>
              Campus Gate Turnstile Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Authorised Gates</span>
                <span className="font-bold text-slate-800">Gate 01 & Gate 04</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Departure Egress</span>
                <span className="font-bold text-slate-800">{outpass.departureTime.replace('T', ' ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Curfew Entry</span>
                <span className="font-bold text-rose-600">{outpass.expectedReturnTime.replace('T', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Final Sanction Desk Form */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">verified</span>
              Associate Dean Final Sanction Memo
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Official Sanction Remark (Logged to Central Security Database)
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 rounded-lg flex items-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                <span>Deny Sanction</span>
              </button>

              <button
                type="button"
                onClick={handleGrantSanction}
                className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
              >
                <span className="material-symbols-outlined text-base">qr_code_2</span>
                <span>Grant Sanction & Tokenize Gate Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reject Dialog */}
        {isRejectOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 text-base text-rose-600 mb-2">Deny Final Sanction</h3>
              <p className="text-xs text-slate-500 mb-3">Provide administrative denial reason:</p>
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
                <button onClick={handleDeny} className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded">
                  Confirm Denial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
