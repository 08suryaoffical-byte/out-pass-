import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassApplication } from '../types';

interface TrackOutpassProps {
  initialOutpassId?: string;
  onNavigateApply?: () => void;
}

export const TrackOutpass: React.FC<TrackOutpassProps> = ({ initialOutpassId, onNavigateApply }) => {
  const { outpasses, currentUser } = useApp();

  // Filter student's applications or all if faculty/admin
  const studentOutpasses = outpasses.filter(o => 
    currentUser?.role === 'student' ? o.studentId === currentUser.id : true
  );

  const defaultId = initialOutpassId || studentOutpasses[0]?.id || outpasses[0]?.id;
  const [selectedId, setSelectedId] = useState<string>(defaultId);
  const [inspectorOverride, setInspectorOverride] = useState<'AUTO' | 'STAGE3' | 'CLEARED' | 'REJECTED'>('AUTO');
  const [qrZoomed, setQrZoomed] = useState(false);

  const rawOutpass = outpasses.find(o => o.id === selectedId) || outpasses[0];

  if (!rawOutpass) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">manage_search</span>
        <h3 className="text-lg font-bold text-slate-800">No Applications Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          You have not submitted any outpass applications yet.
        </p>
        {onNavigateApply && (
          <button
            onClick={onNavigateApply}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow"
          >
            Apply for Outpass Now
          </button>
        )}
      </div>
    );
  }

  // Handle inspector state simulation
  let outpass: OutpassApplication = { ...rawOutpass };
  if (inspectorOverride === 'STAGE3') {
    outpass.status = 'Pending HOD';
    outpass.currentStage = 3;
  } else if (inspectorOverride === 'CLEARED') {
    outpass.status = 'Approved';
    outpass.currentStage = outpass.totalStages;
    outpass.approvalSteps = outpass.approvalSteps.map(s => ({
      ...s,
      status: 'approved',
      timestamp: s.timestamp || '21 Feb 2025, 14:30 IST',
      remarks: s.remarks || 'Institutional clearance granted.',
    }));
  } else if (inspectorOverride === 'REJECTED') {
    outpass.status = 'Rejected';
    outpass.rejectionReason = 'Curfew violation record detected in prior residential cycle. Please contact warden office.';
    outpass.rejectionStage = 'Associate Dean Review';
    outpass.rejectedBy = 'Dr. Shankar';
  }

  const isApproved = outpass.status === 'Approved';
  const isRejected = outpass.status === 'Rejected';
  const isPending = !isApproved && !isRejected;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
            <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Egress Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Track My Outpass</h1>
          <p className="text-sm text-slate-500">
            Real-time institutional approval timeline, multi-tier audit trail, and digital gate pass verification.
          </p>
        </div>

        {/* Dropdown Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setInspectorOverride('AUTO');
              }}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              {studentOutpasses.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} [{o.type} - {o.status}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setInspectorOverride('AUTO')}
            title="Refresh application state"
            className="p-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Print Dossier</span>
          </button>

          <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Multi-tier Timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Application Details Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-blue-600 p-2 bg-blue-50 rounded-lg">
                  local_activity
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">#{outpass.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">{outpass.type}</span>
                    {outpass.isExtended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Extended &gt;48h
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Submitted on {new Date(outpass.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} via Student Portal
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    FULLY APPROVED / CLEARED
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    APPLICATION REJECTED
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    IN MULTI-TIER REVIEW
                  </span>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Student Credential
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="material-symbols-outlined text-blue-600 text-base">badge</span>
                  {outpass.studentName}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Roll: {outpass.registerNumber} • {outpass.departmentName}
                </p>
                <p className="text-slate-500">{outpass.yearSection} • {outpass.hostelInfo}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Destination Transit
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="material-symbols-outlined text-rose-600 text-base">pin_drop</span>
                  {outpass.destinationAddress.split(',')[0]}
                </p>
                <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {outpass.destinationAddress}
                </p>
              </div>

              {/* Schedule */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Egress & Return Schedule
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Departure Window</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {outpass.departureTime.replace('T', ' ')} IST
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-2 rounded bg-blue-50 text-blue-800 text-center">
                    <span className="material-symbols-outlined text-base mr-1">timelapse</span>
                    <span className="font-bold text-xs">{outpass.durationString}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Expected Return Curfew</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {outpass.expectedReturnTime.replace('T', ' ')} IST
                    </span>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Stated Reason For Leave
                </span>
                <p className="text-slate-700 italic font-serif text-xs leading-relaxed">
                  "{outpass.purpose}"
                </p>
              </div>

              {/* Parental State & Documents */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Parental Consent State
                  </span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    OTP Authenticated via SMS
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{outpass.parentPhone} ({outpass.parentName})</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Attached Supporting Proof
                  </span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-rose-500 text-[16px]">picture_as_pdf</span>
                    {outpass.documents[0]?.name || 'Parent_Consent_Signed.pdf'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">1.8 MB • Encrypted Hash verified</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Opening preview of ${outpass.documents[0]?.name || 'attachment'}`)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition"
                >
                  View Proof
                </button>
              </div>
            </div>

            {/* Rejection Alert if applicable */}
            {isRejected && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="material-symbols-outlined text-rose-600 text-base">cancel</span>
                  Rejection Issued by {outpass.rejectedBy || 'Authority'} ({outpass.rejectionStage || 'Administrative Desk'})
                </div>
                <p className="text-rose-800 pl-6 leading-relaxed">
                  Reason: "{outpass.rejectionReason || 'Non-compliance with residential curfew guidelines.'}"
                </p>
                <div className="mt-3 pl-6 flex items-center gap-3">
                  <button
                    onClick={onNavigateApply}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition"
                  >
                    Submit Corrected Application
                  </button>
                  <span className="text-rose-600 text-[11px]">
                    Or contact Hostel Warden Desk for grievance review
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Tier Approval Timeline */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">timeline</span>
                  Multi-Tier Approval Timeline
                </h3>
                <p className="text-xs text-slate-500">
                  Sequential institutional clearance mandatory for turnstile QR tokenization.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
                Tamper-evident Audit Ledger
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {outpass.approvalSteps.map((step, idx) => {
                const stepNumber = step.stage || idx + 1;
                const isStepApproved = step.status === 'approved';
                const isStepRejected = step.status === 'rejected';
                const isCurrent = stepNumber === outpass.currentStage && !isApproved && !isRejected;
                const isStepPending = step.status === 'pending' && !isCurrent;

                return (
                  <div key={idx} className="relative group">
                    {/* Step Icon */}
                    <span
                      className={`absolute -left-8 top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isStepApproved
                          ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50'
                          : isStepRejected
                          ? 'bg-rose-500 text-white shadow-sm ring-4 ring-rose-50'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isStepApproved ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : isStepRejected ? (
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      ) : isCurrent ? (
                        <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                      ) : (
                        stepNumber
                      )}
                    </span>

                    {/* Content Box */}
                    <div
                      className={`p-4 rounded-xl border transition ${
                        isCurrent
                          ? 'border-blue-400 bg-blue-50/30 shadow-xs'
                          : isStepApproved
                          ? 'border-slate-200 bg-white'
                          : isStepRejected
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-slate-100 bg-slate-50/50 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Stage 0{stepNumber} {isCurrent && '• Current Active Tier'}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{step.roleName}</span>
                        </div>
                        <div>
                          {isStepApproved && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Approved
                            </span>
                          )}
                          {isStepRejected && (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Rejected
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                              Under Review
                            </span>
                          )}
                          {isStepPending && (
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              In Queue
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-y-1 gap-x-3">
                        {step.approverName && (
                          <span className="font-medium text-slate-800">
                            Evaluator: {step.approverName}
                          </span>
                        )}
                        {step.timestamp && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {step.timestamp}
                          </span>
                        )}
                      </div>

                      {step.remarks && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                          "{step.remarks}"
                        </div>
                      )}

                      {step.signature && (
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Digital Signature: {step.signature}</span>
                          <span className="text-emerald-600 font-sans font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            PGP Cleared
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Visualizer / Institutional State Inspector */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Operational Visualizer
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Institutional State Inspector
                </h4>
              </div>
              <span className="text-xs text-slate-400">Inspect system behavior across approval lifecycles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setInspectorOverride('STAGE3')}
                className={`p-3 rounded-lg border text-left transition ${
                  inspectorOverride === 'STAGE3'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-blue-700">Active Flow</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <div className="font-bold text-xs text-slate-900">Stage 3 In-Review</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Simulates live approval tree with HOD evaluation.</p>
              </button>

              <button
                type="button"
                onClick={() => setInspectorOverride('CLEARED')}
                className={`p-3 rounded-lg border text-left transition ${
                  inspectorOverride === 'CLEARED'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Cleared</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="font-bold text-xs text-slate-900">Full Clearance</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Displays active QR token, HMAC signature & gate pass.</p>
              </button>

              <button
                type="button"
                onClick={() => setInspectorOverride('REJECTED')}
                className={`p-3 rounded-lg border text-left transition ${
                  inspectorOverride === 'REJECTED'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-rose-700">Refusal</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </div>
                <div className="font-bold text-xs text-slate-900">Administrative Denial</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Inspects Dean rejection banner with corrective appeal path.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Digital Gate Pass Card & Curfew Advisory */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digital Gate Pass */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
                  <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Gate Credentials
                  </span>
                  <span className="text-base font-bold">Digital Gate Pass</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isApproved ? 'VALID FOR SCAN' : 'PRE-RELEASE'}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Pass Holder Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {outpass.studentName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">{outpass.studentName}</div>
                  <div className="text-xs text-slate-500 font-mono">{outpass.registerNumber} • {outpass.hostelInfo.split('(')[0]}</div>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-2xl">qr_code_2</span>
              </div>

              {/* Transit Parameters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Authorised Exit</span>
                  <span className="font-bold text-slate-800">Gate 01 / Gate 04</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Room Number</span>
                  <span className="font-bold text-slate-800">{outpass.roomNumber}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valid Egress From</span>
                  <span className="font-bold text-slate-800">{outpass.departureTime.split('T')[0]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Curfew Return</span>
                  <span className="font-bold text-slate-800">{outpass.expectedReturnTime.split('T')[1] || '20:00'} IST</span>
                </div>
              </div>

              {/* Dynamic QR Code Box */}
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-6 text-center overflow-hidden">
                {isApproved ? (
                  <div className="flex flex-col items-center">
                    {/* Active QR SVG Matrix */}
                    <div 
                      onClick={() => setQrZoomed(!qrZoomed)}
                      className="cursor-pointer bg-white p-3 rounded-lg shadow-sm border border-slate-200 group relative"
                    >
                      <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                        {/* Realistic Mock QR matrix */}
                        <rect width="100" height="100" fill="white" />
                        {/* Position Markers */}
                        <rect x="5" y="5" width="26" height="26" fill="#0F172A" />
                        <rect x="9" y="9" width="18" height="18" fill="white" />
                        <rect x="13" y="13" width="10" height="10" fill="#2563EB" />

                        <rect x="69" y="5" width="26" height="26" fill="#0F172A" />
                        <rect x="73" y="9" width="18" height="18" fill="white" />
                        <rect x="77" y="13" width="10" height="10" fill="#2563EB" />

                        <rect x="5" y="69" width="26" height="26" fill="#0F172A" />
                        <rect x="9" y="73" width="18" height="18" fill="white" />
                        <rect x="13" y="77" width="10" height="10" fill="#2563EB" />

                        {/* Random pattern data cells */}
                        <rect x="36" y="8" width="5" height="5" fill="#0F172A" />
                        <rect x="46" y="8" width="5" height="5" fill="#0F172A" />
                        <rect x="56" y="8" width="5" height="5" fill="#0F172A" />
                        <rect x="36" y="18" width="8" height="8" fill="#2563EB" />
                        <rect x="48" y="18" width="6" height="6" fill="#0F172A" />
                        <rect x="58" y="18" width="6" height="6" fill="#0F172A" />

                        <rect x="8" y="36" width="6" height="6" fill="#0F172A" />
                        <rect x="18" y="36" width="6" height="6" fill="#0F172A" />
                        <rect x="28" y="36" width="6" height="6" fill="#2563EB" />
                        <rect x="38" y="36" width="6" height="6" fill="#0F172A" />
                        <rect x="48" y="36" width="6" height="6" fill="#0F172A" />
                        <rect x="58" y="36" width="8" height="8" fill="#2563EB" />
                        <rect x="72" y="36" width="6" height="6" fill="#0F172A" />
                        <rect x="82" y="36" width="8" height="8" fill="#0F172A" />

                        <rect x="10" y="48" width="8" height="8" fill="#0F172A" />
                        <rect x="22" y="48" width="6" height="6" fill="#2563EB" />
                        <rect x="32" y="48" width="6" height="6" fill="#0F172A" />
                        <rect x="42" y="48" width="6" height="6" fill="#0F172A" />
                        <rect x="52" y="48" width="6" height="6" fill="#2563EB" />
                        <rect x="62" y="48" width="6" height="6" fill="#0F172A" />
                        <rect x="74" y="48" width="6" height="6" fill="#0F172A" />
                        <rect x="84" y="48" width="6" height="6" fill="#2563EB" />

                        <rect x="8" y="58" width="6" height="6" fill="#0F172A" />
                        <rect x="20" y="58" width="6" height="6" fill="#0F172A" />
                        <rect x="34" y="58" width="6" height="6" fill="#0F172A" />
                        <rect x="46" y="58" width="8" height="8" fill="#2563EB" />
                        <rect x="58" y="58" width="6" height="6" fill="#0F172A" />
                        <rect x="70" y="58" width="6" height="6" fill="#0F172A" />
                        <rect x="82" y="58" width="6" height="6" fill="#0F172A" />

                        <rect x="38" y="72" width="6" height="6" fill="#0F172A" />
                        <rect x="48" y="72" width="6" height="6" fill="#2563EB" />
                        <rect x="58" y="72" width="6" height="6" fill="#0F172A" />
                        <rect x="70" y="72" width="6" height="6" fill="#0F172A" />
                        <rect x="82" y="72" width="8" height="8" fill="#2563EB" />

                        <rect x="36" y="82" width="8" height="8" fill="#2563EB" />
                        <rect x="48" y="82" width="6" height="6" fill="#0F172A" />
                        <rect x="60" y="82" width="6" height="6" fill="#0F172A" />
                        <rect x="74" y="82" width="6" height="6" fill="#0F172A" />
                        <rect x="86" y="82" width="6" height="6" fill="#0F172A" />
                      </svg>
                    </div>

                    <div className="mt-3 text-xs font-mono text-slate-500">
                      TOKEN: <span className="font-bold text-slate-800">{outpass.hmacSignature || 'HMAC-SHA256-4f8a...e71c'}</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active on Biometric Turnstiles
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-3xl">lock</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700">QR Pass Token Locked</div>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mt-1">
                      Activates automatically upon Dean regulatory clearance.
                    </p>
                    <div className="mt-4 text-[10px] font-mono text-slate-400 bg-slate-200/50 px-2 py-1 rounded">
                      TURNSTILE HMAC STUB: PENDING KEY
                    </div>
                  </div>
                )}
              </div>

              {/* Pass Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Download Official Application
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Tracking link copied to clipboard:\nhttps://outpass.dsuniversity.ac.in/track/${outpass.id}`)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  Share Tracking Link with Guardian
                </button>
              </div>
            </div>
          </div>

          {/* Curfew & Egress Advisory */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-base">shield</span>
              Curfew & Egress Advisory
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Egress Turnstiles</span>
                <p className="font-semibold text-slate-800">Kaveri Boys Hostel Gate 01 & Main Campus Gate 04</p>
                <p className="text-[11px] text-slate-500">Biometric turnstiles will accept QR token precisely within departure window.</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mandatory In-Curfew</span>
                <p className="font-semibold text-rose-600">20:00 IST • Monday, 24 Feb 2025</p>
                <p className="text-[11px] text-slate-500">Arrival reporting at Hostel Security desk is strictly mandatory.</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Automatic Escalation Rule</span>
                <p className="text-[11px] text-slate-500">
                  Unaccounted delay exceeding <strong>30 minutes</strong> past registered curfew automatically dispatches emergency escalation alerts to Chief Warden, Proctor, and Registered Guardian.
                </p>
              </div>
            </div>
          </div>

          {/* Support & Assistance */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-base">support_agent</span>
                Support & Assistance
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h4>
            <div className="space-y-2">
              <a href="tel:+9104422578900" className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition">
                <div>
                  <div className="font-semibold text-xs text-slate-800">Hostel Warden Desk</div>
                  <div className="text-[11px] text-slate-400">+91 044-2257-8900</div>
                </div>
                <span className="material-symbols-outlined text-blue-600 text-base">call</span>
              </a>
              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-800">Faculty Mentor Cabin</div>
                  <div className="text-[11px] text-slate-400">Dept. CSE • Cabin #204</div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">mail</span>
              </div>
              <a href="tel:108" className="p-2.5 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-between hover:bg-rose-100 transition">
                <div>
                  <div className="font-semibold text-xs">Emergency Gate Security</div>
                  <div className="text-[11px] text-rose-600">SOS Extension: 108 / 112</div>
                </div>
                <span className="material-symbols-outlined text-rose-600 text-base">emergency</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
